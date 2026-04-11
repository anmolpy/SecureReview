import { COOKIE_NAME } from "@shared/const";
import { createHash, randomUUID } from "node:crypto";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

// --- Gemini / LLM helpers ---

const SEVERITY_ORDER: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Informational: 4,
};

type AuditAttempt = {
  provider: string;
  model: string;
  status: "started" | "failed" | "succeeded";
  timestamp: number;
  error?: string;
};

type AuditRunStatus = {
  requestId: string;
  ownerKey: string;
  status: "running" | "succeeded" | "failed";
  message: string;
  currentProvider: string | null;
  currentModel: string | null;
  attempts: AuditAttempt[];
  updatedAt: number;
};

type AnalyzeRateLimitState = {
  count: number;
  windowStart: number;
};

const AUDIT_STATUS_TTL_MS = 10 * 60 * 1000;
const auditStatusStore = new Map<string, AuditRunStatus>();
const ANALYZE_WINDOW_MS = 60_000;
const ANALYZE_MAX_REQUESTS_PER_WINDOW = 12;
const analyzeRateLimitStore = new Map<string, AnalyzeRateLimitState>();

function resolveClientKey(ctx: TrpcContext): string {
  const ip =
    ctx.req.ip ||
    ctx.req.socket?.remoteAddress ||
    "unknown-ip";
  const userAgent = String(ctx.req.headers["user-agent"] || "unknown-ua");
  return createHash("sha256").update(`${ip}|${userAgent}`).digest("hex");
}

function consumeAnalyzeQuota(clientKey: string): boolean {
  const now = Date.now();
  const current = analyzeRateLimitStore.get(clientKey);

  if (!current || now - current.windowStart >= ANALYZE_WINDOW_MS) {
    analyzeRateLimitStore.set(clientKey, {
      count: 1,
      windowStart: now,
    });
    return true;
  }

  if (current.count >= ANALYZE_MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  analyzeRateLimitStore.set(clientKey, {
    ...current,
    count: current.count + 1,
  });
  return true;
}

const cleanupStaleAuditStatuses = () => {
  const cutoff = Date.now() - AUDIT_STATUS_TTL_MS;
  for (const [requestId, status] of auditStatusStore.entries()) {
    if (status.updatedAt < cutoff) {
      auditStatusStore.delete(requestId);
    }
  }

  // Opportunistic cleanup for limiter state to keep memory bounded.
  for (const [clientKey, state] of analyzeRateLimitStore.entries()) {
    if (Date.now() - state.windowStart >= ANALYZE_WINDOW_MS * 2) {
      analyzeRateLimitStore.delete(clientKey);
    }
  }
};

const upsertAuditStatus = (
  requestId: string,
  updater: (current: AuditRunStatus) => AuditRunStatus
) => {
  const current = auditStatusStore.get(requestId);
  if (!current) return;
  const next = updater(current);
  next.updatedAt = Date.now();
  auditStatusStore.set(requestId, next);
};

function buildPrompt(code: string, language: string): string {
  const langHint =
    language === "Auto-detect" ? "" : ` The code is written in ${language}.`;
  return `You are a secure code auditor.${langHint} Analyze the provided code and respond ONLY with a JSON object (no markdown, no extra text) in this exact format:
{
  "language": "string",
  "summary": "string",
  "overall_risk": "Critical" | "High" | "Medium" | "Low" | "Clean",
  "findings": [
    {
      "id": "CWE-XXX",
      "title": "string",
      "severity": "Critical" | "High" | "Medium" | "Low" | "Informational",
      "line_hint": "string or null",
      "description": "string",
      "remediation": "string"
    }
  ]
}

Focus on: SQL injection, command injection, broken authentication, hardcoded secrets, buffer overflows, path traversal, insecure cryptographic algorithms, and insecure deserialization flaws. If no vulnerabilities are found, return an empty findings array and overall_risk of "Clean".

Code to analyze:
\`\`\`
${code}
\`\`\``;
}

function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

const auditResultSchema = z.object({
  language: z.string(),
  summary: z.string(),
  overall_risk: z.enum(["Critical", "High", "Medium", "Low", "Clean"]),
  findings: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      severity: z.enum(["Critical", "High", "Medium", "Low", "Informational"]),
      line_hint: z.string().nullable(),
      description: z.string(),
      remediation: z.string(),
    })
  ),
});

function extractTextFromLLMContent(content: unknown): string {
  if (typeof content === "string") return content;

  if (!Array.isArray(content)) return JSON.stringify(content ?? "");

  const textParts = content
    .map((part) => {
      if (typeof part === "string") return part;
      if (
        part &&
        typeof part === "object" &&
        "type" in part &&
        (part as { type?: unknown }).type === "text" &&
        "text" in part
      ) {
        const text = (part as { text?: unknown }).text;
        return typeof text === "string" ? text : "";
      }
      return "";
    })
    .filter(Boolean);

  if (textParts.length > 0) {
    return textParts.join("\n");
  }

  return JSON.stringify(content);
}

function extractFirstJsonObject(text: string): string | null {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (ch === "}") {
      if (depth === 0) continue;
      depth -= 1;
      if (depth === 0 && start >= 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function parseAuditJson(rawText: string) {
  const cleaned = stripMarkdownFences(rawText);
  const candidates = [cleaned];

  const extracted = extractFirstJsonObject(cleaned);
  if (extracted && extracted !== cleaned) {
    candidates.push(extracted);
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const validated = auditResultSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
    } catch {
      // Try next candidate.
    }
  }

  return null;
}

// --- tRPC Router ---

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  audit: router({
    status: publicProcedure
      .input(z.object({ requestId: z.string().min(8).max(128) }))
      .query(({ input, ctx }) => {
        cleanupStaleAuditStatuses();
        const status = auditStatusStore.get(input.requestId);
        if (!status) return null;

        const clientKey = resolveClientKey(ctx);
        if (status.ownerKey !== clientKey) {
          return null;
        }

        return status;
      }),
    analyze: publicProcedure
      .input(
        z.object({
          code: z.string().min(1, "Code is required").max(100_000),
          language: z.string().default("Auto-detect"),
          requestId: z.string().min(8).max(128).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        cleanupStaleAuditStatuses();

        const clientKey = resolveClientKey(ctx);
        if (!consumeAnalyzeQuota(clientKey)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Rate limit exceeded. Please wait before starting another analysis.",
          });
        }

        const requestId = input.requestId ?? randomUUID();
        const existingStatus = auditStatusStore.get(requestId);
        if (existingStatus && existingStatus.ownerKey !== clientKey) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Invalid analysis request identifier.",
          });
        }

        auditStatusStore.set(requestId, {
          requestId,
          ownerKey: clientKey,
          status: "running",
          message: "Starting analysis...",
          currentProvider: null,
          currentModel: null,
          attempts: [],
          updatedAt: Date.now(),
        });

        const prompt = buildPrompt(input.code, input.language);

        let rawText: string;

        try {
          const llmResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are a secure code auditor. Respond ONLY with valid JSON. No markdown fences, no extra text.",
              },
              { role: "user", content: prompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "audit_result",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    language: { type: "string", description: "Detected programming language" },
                    summary: { type: "string", description: "Brief summary of the audit" },
                    overall_risk: {
                      type: "string",
                      enum: ["Critical", "High", "Medium", "Low", "Clean"],
                      description: "Overall risk level",
                    },
                    findings: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "CWE ID e.g. CWE-78" },
                          title: { type: "string", description: "Short title of the finding" },
                          severity: {
                            type: "string",
                            enum: ["Critical", "High", "Medium", "Low", "Informational"],
                          },
                          line_hint: {
                            type: ["string", "null"],
                            description: "Approximate line or code snippet",
                          },
                          description: { type: "string", description: "Detailed description" },
                          remediation: { type: "string", description: "How to fix it" },
                        },
                        required: ["id", "title", "severity", "line_hint", "description", "remediation"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["language", "summary", "overall_risk", "findings"],
                  additionalProperties: false,
                },
              },
            },
            onAttemptEvent: (event) => {
              if (event.type === "attempt-start") {
                upsertAuditStatus(requestId, (current) => ({
                  ...current,
                  status: "running",
                  message: `Analyzing with ${event.provider} (${event.model})...`,
                  currentProvider: event.provider,
                  currentModel: event.model,
                  attempts: [
                    ...current.attempts,
                    {
                      provider: event.provider,
                      model: event.model,
                      status: "started",
                      timestamp: event.timestamp,
                    },
                  ],
                }));
                return;
              }

              if (event.type === "attempt-failed") {
                upsertAuditStatus(requestId, (current) => ({
                  ...current,
                  status: "running",
                  message: `Provider ${event.provider} failed, switching models...`,
                  currentProvider: event.provider,
                  currentModel: event.model,
                  attempts: [
                    ...current.attempts,
                    {
                      provider: event.provider,
                      model: event.model,
                      status: "failed",
                      timestamp: event.timestamp,
                      error: event.error,
                    },
                  ],
                }));
                return;
              }

              upsertAuditStatus(requestId, (current) => ({
                ...current,
                status: "running",
                message: `Response ready from ${event.provider} (${event.model}).`,
                currentProvider: event.provider,
                currentModel: event.model,
                attempts: [
                  ...current.attempts,
                  {
                    provider: event.provider,
                    model: event.model,
                    status: "succeeded",
                    timestamp: event.timestamp,
                  },
                ],
              }));
            },
          });

          upsertAuditStatus(requestId, (current) => ({
            ...current,
            status: "succeeded",
            message: `Completed with ${llmResponse.provider} (${llmResponse.model}).`,
            currentProvider: llmResponse.provider,
            currentModel: llmResponse.model,
          }));

          const content = llmResponse.result.choices?.[0]?.message?.content;
          rawText = extractTextFromLLMContent(content);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "LLM invocation failed";
          upsertAuditStatus(requestId, (current) => ({
            ...current,
            status: "failed",
            message,
          }));
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message,
          });
        }

        if (!rawText) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Empty response from AI",
          });
        }

        const result = parseAuditJson(rawText);

        if (!result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to parse AI response as JSON. Please try again.",
          });
        }

        // Sort findings by severity (Critical first)
        if (result.findings && Array.isArray(result.findings)) {
          result.findings.sort(
            (a, b) =>
              (SEVERITY_ORDER[a.severity] ?? 99) -
              (SEVERITY_ORDER[b.severity] ?? 99)
          );
        }

        return {
          ...result,
          analysis_meta: {
            requestId,
            provider: auditStatusStore.get(requestId)?.currentProvider,
            model: auditStatusStore.get(requestId)?.currentModel,
            attempts: auditStatusStore.get(requestId)?.attempts ?? [],
          },
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
