import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Gracefully degrade when env vars are not set (dev/demo mode)
const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// 5 requests per 15 minutes per IP for sensitive auth endpoints
export const authRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: false,
      prefix: "nidoo:auth",
    })
  : null;

// OTP helpers — store in Redis with 10 min TTL
export async function storeOtp(email: string, otp: string): Promise<void> {
  if (!redis) return; // no-op in demo mode
  await redis.set(`otp:${email}`, otp, { ex: 600 });
}

export async function verifyOtp(
  email: string,
  candidate: string
): Promise<boolean> {
  if (!redis) {
    // Demo mode: accept "123456"
    return candidate === "123456";
  }
  const stored = await redis.get<string>(`otp:${email}`);
  if (!stored || stored !== candidate) return false;
  await redis.del(`otp:${email}`);
  return true;
}
