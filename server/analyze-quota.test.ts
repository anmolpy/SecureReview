import { afterEach, describe, expect, it, vi } from "vitest";
import { acquireAnalyzeQuota } from "./analyze-quota";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("analysis quotas", () => {
  it("limits one peer regardless of User-Agent changes", async () => {
    vi.stubEnv("NODE_ENV", "test");
    for (let n = 0; n < 12; n++) (await acquireAnalyzeQuota("peer-one"))();
    await expect(acquireAnalyzeQuota("peer-one")).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
  });
  it("reserves concurrency atomically and releases idempotently", async () => {
    const one = await acquireAnalyzeQuota("parallel-1");
    const two = await acquireAnalyzeQuota("parallel-2");
    await expect(acquireAnalyzeQuota("parallel-3")).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
    one();
    one();
    two();
    (await acquireAnalyzeQuota("parallel-3"))();
  });
  it("fails closed without shared production storage", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    await expect(acquireAnalyzeQuota("production")).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
    });
  });
  it("fails closed when shared quota storage is unavailable or rejects a request", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://quota.example.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "synthetic");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(acquireAnalyzeQuota("redis")).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: 0 }) })
    );
    await expect(acquireAnalyzeQuota("redis")).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
  });
});
