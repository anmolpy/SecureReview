import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  model?: string;
  models?: string[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  onAttemptEvent?: (event: LLMInvokeEvent) => void;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

export type ProviderName = "openrouter" | "forge" | "gemini" | "huggingface";

export type LLMInvokeAttempt = {
  provider: ProviderName;
  model: string;
  status: "started" | "failed" | "succeeded";
  timestamp: number;
  error?: string;
};

export type LLMInvokeEvent =
  | {
      type: "attempt-start";
      provider: ProviderName;
      model: string;
      timestamp: number;
    }
  | {
      type: "attempt-failed";
      provider: ProviderName;
      model: string;
      timestamp: number;
      error: string;
    }
  | {
      type: "attempt-success";
      provider: ProviderName;
      model: string;
      timestamp: number;
    };

export type InvokeLLMResult = {
  result: InvokeResult;
  provider: ProviderName;
  model: string;
  attempts: LLMInvokeAttempt[];
};

type ProviderConfig = {
  name: ProviderName;
  apiUrl: string;
  apiKey: string;
  defaultModel: string;
  supportsThinking: boolean;
  supportsJsonSchema?: boolean;
  maxOutputTokens?: number;
  extraHeaders?: Record<string, string>;
};

class LLMProviderError extends Error {
  constructor(
    readonly provider: ProviderName,
    readonly model: string,
    readonly status: number,
    readonly statusText: string,
    readonly body: string
  ) {
    super(
      `[${provider}/${model}] ${status} ${statusText}${body ? ` - ${body}` : ""}`
    );
  }
}

const RETRYABLE_HTTP_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES_PER_MODEL = 2;
const LLM_UNAVAILABLE_MESSAGE =
  "Either No LLM provider configured or all models are busy";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const normalizeErrorBody = (body: string): string => {
  const compact = body.replace(/\s+/g, " ").trim();
  if (!compact) return "";

  // Collapse giant HTML gateway pages to a short, readable summary.
  if (compact.startsWith("<!DOCTYPE html") || compact.startsWith("<html")) {
    return "Upstream gateway returned HTML error page";
  }

  return compact.length > 400 ? `${compact.slice(0, 400)}...` : compact;
};

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const OPENROUTER_DEFAULT_MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-sonnet",
];

const parseCsv = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const resolvePreferredModels = (params: InvokeParams): string[] => {
  if (params.models && params.models.length > 0) {
    return params.models.filter((model) => model.trim().length > 0);
  }

  if (params.model && params.model.trim().length > 0) {
    return [params.model.trim()];
  }

  const configured = parseCsv(ENV.openRouterModels);
  if (configured.length > 0) {
    return configured;
  }

  return OPENROUTER_DEFAULT_MODELS;
};

const resolveProviders = (): ProviderConfig[] => {
  const providers: ProviderConfig[] = [];

  if (ENV.openRouterApiKey.trim().length > 0) {
    const extraHeaders: Record<string, string> = {
      "X-Title": ENV.openRouterAppName || "SecureReview",
    };

    if (ENV.openRouterSiteUrl.trim().length > 0) {
      extraHeaders["HTTP-Referer"] = ENV.openRouterSiteUrl.trim();
    }

    providers.push({
      name: "openrouter",
      apiUrl: `${ENV.openRouterApiUrl.replace(/\/$/, "")}/chat/completions`,
      apiKey: ENV.openRouterApiKey,
      defaultModel: "google/gemini-2.5-flash",
      supportsThinking: false,
      supportsJsonSchema: true,
      maxOutputTokens: 32768,
      extraHeaders,
    });
  }

  if (ENV.forgeApiUrl.trim().length > 0 && ENV.forgeApiKey.trim().length > 0) {
    providers.push({
      name: "forge",
      apiUrl: `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`,
      apiKey: ENV.forgeApiKey,
      defaultModel: "gemini-2.5-flash",
      supportsThinking: true,
      supportsJsonSchema: true,
      maxOutputTokens: 32768,
    });
  }

  if (ENV.geminiApiKey.trim().length > 0) {
    providers.push({
      name: "gemini",
      apiUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      apiKey: ENV.geminiApiKey,
      defaultModel: "gemini-2.5-flash",
      supportsThinking: false,
      supportsJsonSchema: true,
      maxOutputTokens: 32768,
    });
  }

  if (ENV.huggingFaceApiKey.trim().length > 0) {
    providers.push({
      name: "huggingface",
      apiUrl: ENV.huggingFaceApiUrl,
      apiKey: ENV.huggingFaceApiKey,
      defaultModel: ENV.huggingFaceModel,
      supportsThinking: false,
      supportsJsonSchema: false,
      maxOutputTokens: 32000,
    });
  }

  if (providers.length === 0) {
    throw new Error(LLM_UNAVAILABLE_MESSAGE);
  }

  return providers;
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeLLMResult> {
  const providers = resolveProviders();
  const preferredModels = resolvePreferredModels(params);

  const {
    messages,
    model,
    models,
    maxTokens,
    max_tokens,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    onAttemptEvent,
  } = params;

  const basePayload: Record<string, unknown> = {
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    basePayload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    basePayload.tool_choice = normalizedToolChoice;
  }

  const requestedMaxTokens = maxTokens ?? max_tokens;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    basePayload.response_format = normalizedResponseFormat;
  }

  const attemptedErrors: string[] = [];
  const attempts: LLMInvokeAttempt[] = [];

  const attemptModels = (provider: ProviderConfig): string[] => {
    if (provider.name === "openrouter") {
      return preferredModels;
    }

    return [model?.trim() || provider.defaultModel];
  };

  let providerRequests = 0;
  for (const provider of providers) {
    for (const selectedModel of attemptModels(provider)) {
      const startTimestamp = Date.now();
      attempts.push({
        provider: provider.name,
        model: selectedModel,
        status: "started",
        timestamp: startTimestamp,
      });
      onAttemptEvent?.({
        type: "attempt-start",
        provider: provider.name,
        model: selectedModel,
        timestamp: startTimestamp,
      });

      const payload: Record<string, unknown> = {
        ...basePayload,
        model: selectedModel,
      };

      const currentResponseFormat = payload.response_format as
        | { type: "json_schema"; json_schema: JsonSchema }
        | { type: "json_object" }
        | { type: "text" }
        | undefined;

      if (
        currentResponseFormat?.type === "json_schema" &&
        provider.supportsJsonSchema === false
      ) {
        payload.response_format = { type: "json_object" };
      }

      const providerLimit = provider.maxOutputTokens ?? 32768;
      const resolvedMaxTokens =
        typeof requestedMaxTokens === "number"
          ? Math.min(Math.max(1, Math.floor(requestedMaxTokens)), providerLimit)
          : Math.min(4096, providerLimit);
      payload.max_tokens = resolvedMaxTokens;

      if (provider.supportsThinking) {
        payload.thinking = { budget_tokens: 128 };
      }

      const headers: Record<string, string> = {
        "content-type": "application/json",
        authorization: `Bearer ${provider.apiKey}`,
        ...(provider.extraHeaders ?? {}),
      };

      let response: Response | null = null;
      let networkError: unknown = null;

      for (let retry = 0; retry <= MAX_RETRIES_PER_MODEL; retry++) {
        try {
          if (++providerRequests > 3) throw new Error("Provider attempt budget exhausted");
          response = await fetch(provider.apiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(30_000),
          });
          networkError = null;
        } catch (err) {
          networkError = err;
        }

        const shouldRetryNetwork = networkError !== null;
        const shouldRetryHttp =
          response !== null && RETRYABLE_HTTP_STATUS.has(response.status);

        if (retry < MAX_RETRIES_PER_MODEL && (shouldRetryNetwork || shouldRetryHttp)) {
          await delay(250 * (retry + 1));
          response = null;
          continue;
        }

        break;
      }

      if (networkError) {
        const providerError = new LLMProviderError(
          provider.name,
          selectedModel,
          0,
          "Network Error",
          networkError instanceof Error ? networkError.message : String(networkError)
        );
        const failTimestamp = Date.now();
        attempts.push({
          provider: provider.name,
          model: selectedModel,
          status: "failed",
          error: providerError.message,
          timestamp: failTimestamp,
        });
        onAttemptEvent?.({
          type: "attempt-failed",
          provider: provider.name,
          model: selectedModel,
          error: providerError.message,
          timestamp: failTimestamp,
        });
        attemptedErrors.push(providerError.message);
        continue;
      }

      if (!response || !response.ok) {
        const status = response?.status ?? 0;
        const statusText = response?.statusText ?? "Unknown Error";
        const errorText = normalizeErrorBody(await response?.text?.() ?? "");
        const providerError = new LLMProviderError(
          provider.name,
          selectedModel,
          status,
          statusText,
          errorText
        );
        const failTimestamp = Date.now();
        attempts.push({
          provider: provider.name,
          model: selectedModel,
          status: "failed",
          error: providerError.message,
          timestamp: failTimestamp,
        });
        onAttemptEvent?.({
          type: "attempt-failed",
          provider: provider.name,
          model: selectedModel,
          error: providerError.message,
          timestamp: failTimestamp,
        });
        attemptedErrors.push(providerError.message);
        continue;
      }

      const successTimestamp = Date.now();
      attempts.push({
        provider: provider.name,
        model: selectedModel,
        status: "succeeded",
        timestamp: successTimestamp,
      });
      onAttemptEvent?.({
        type: "attempt-success",
        provider: provider.name,
        model: selectedModel,
        timestamp: successTimestamp,
      });

      return {
        result: (await response.json()) as InvokeResult,
        provider: provider.name,
        model: selectedModel,
        attempts,
      };
    }
  }

  throw new Error(LLM_UNAVAILABLE_MESSAGE);
}
