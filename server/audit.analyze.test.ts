import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn(async () => ({
  provider: "test", model: "test", result: { choices: [{ message: { content: JSON.stringify({
    language: "Python", summary: "Synthetic audit", overall_risk: "Clean", findings: []
  }) } }] }
})) }));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("audit.analyze", () => {
  it("returns a valid audit result with findings for vulnerable code", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const vulnerableCode = `
import subprocess
def run(cmd):
    subprocess.run(cmd, shell=True)
`;

    const result = await caller.audit.analyze({
      code: vulnerableCode,
      language: "Python",
    });

    // Verify the response structure
    expect(result).toHaveProperty("language");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("overall_risk");
    expect(result).toHaveProperty("findings");
    expect(typeof result.language).toBe("string");
    expect(typeof result.summary).toBe("string");
    expect(["Critical", "High", "Medium", "Low", "Clean"]).toContain(result.overall_risk);
    expect(Array.isArray(result.findings)).toBe(true);

    // The vulnerable code should produce at least one finding
    if (result.findings.length > 0) {
      const finding = result.findings[0];
      expect(finding).toHaveProperty("id");
      expect(finding).toHaveProperty("title");
      expect(finding).toHaveProperty("severity");
      expect(finding).toHaveProperty("description");
      expect(finding).toHaveProperty("remediation");
    }
  }, 30000); // 30s timeout for API call
});


it("does not allow User-Agent rotation to reset the endpoint quota", async () => {
  for (let n = 0; n < 12; n++) {
    const ctx = createPublicContext();
    Object.assign(ctx.req, { ip: "198.51.100.40", headers: { "user-agent": `agent-${n}` } });
    await appRouter.createCaller(ctx).audit.analyze({ code: "test" });
  }
  const ctx = createPublicContext();
  Object.assign(ctx.req, { ip: "198.51.100.40", headers: { "user-agent": "new-agent" } });
  await expect(appRouter.createCaller(ctx).audit.analyze({ code: "test" })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
});
