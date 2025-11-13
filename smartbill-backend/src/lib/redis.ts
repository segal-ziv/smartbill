import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("Missing REDIS_URL environment variable");
}

// Check if using Upstash (requires TLS)
const isUpstash = process.env.REDIS_URL.includes("upstash.io");
const isProduction = process.env.NODE_ENV === "production";

// Configure Redis client with TLS support for Upstash
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  // Enable TLS for Upstash or production environments
  tls: isUpstash || isProduction ? {} : undefined,
  // Connection settings for better reliability
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
    if (targetErrors.some((target) => err.message.includes(target))) {
      return true;
    }
    return false;
  },
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("ready", () => {
  console.log("Redis ready to accept commands");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

export default redis;
