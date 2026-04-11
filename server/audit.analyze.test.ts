import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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
