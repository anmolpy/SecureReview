import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";

const script = `
for i,key in ipairs(KEYS) do
  if tonumber(redis.call('GET', key) or '0') >= tonumber(ARGV[i*2-1]) then return 0 end
end
for i,key in ipairs(KEYS) do
  local n = redis.call('INCR', key)
  if n == 1 then redis.call('EXPIRE', key, ARGV[i*2]) end
end
return 1`;
const memory = new Map<string, { count: number; expires: number }>();
let active = 0;

export function quotaIdentity(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export async function acquireAnalyzeQuota(ip: string): Promise<() => void> {
  if (active >= 2)
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Service busy. Try later.",
    });
  active++;
  try {
    const identity = quotaIdentity(ip);
    const limits: [string, number, number][] = [
      [`securereview:minute:${identity}`, 12, 60],
      [`securereview:day:${identity}`, 50, 86400],
      ["securereview:global:day", 200, 86400],
    ];
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    let allowed: boolean;
    if (url && token) {
      if (!url.startsWith("https://"))
        throw new Error("Quota storage requires HTTPS");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          "EVAL",
          script,
          limits.length,
          ...limits.map(x => x[0]),
          ...limits.flatMap(x => [x[1], x[2]]),
        ]),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error("Quota storage unavailable");
      const payload = await response.json();
      if (payload.error || ![0, 1].includes(payload.result))
        throw new Error("Invalid quota response");
      allowed = payload.result === 1;
    } else {
      if (!["development", "test"].includes(process.env.NODE_ENV || ""))
        throw new Error("Shared quota storage is required");
      const now = Date.now();
      for (const [key, value] of Array.from(memory.entries()))
        if (value.expires <= now) memory.delete(key);
      allowed = limits.every(
        ([key, cap]) => (memory.get(key)?.count || 0) < cap
      );
      if (allowed)
        for (const [key, , seconds] of limits) {
          const state = memory.get(key) || {
            count: 0,
            expires: now + seconds * 1000,
          };
          state.count++;
          memory.set(key, state);
        }
    }
    if (!allowed)
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Demo usage limit reached. Try later.",
      });
    let released = false;
    return () => {
      if (!released) {
        released = true;
        active--;
      }
    };
  } catch (error) {
    active--;
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "Analysis temporarily unavailable.",
    });
  }
}
