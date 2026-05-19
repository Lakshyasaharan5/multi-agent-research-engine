import Redis from "ioredis";

let redis: Redis | null = null;

export function initRedis(): void {
    if (!process.env.REDIS_URL) {
        console.warn("REDIS_URL not set. Cache disabled.");
        return;
    }

    if (redis) return;

    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 0,
        enableOfflineQueue: false,
        retryStrategy: () => null,
        lazyConnect: false,
    });

    redis.on("connect", () => {
        console.log("Redis connected");
    });

    redis.on("ready", () => {
        console.log("Redis ready");
    });

    redis.on("error", (error) => {
        console.warn("Redis unavailable:", error.message);
    });

    redis.on("close", () => {
        console.warn("Redis connection closed");
    });

    redis.on("end", () => {
        console.warn("Redis connection ended");
    });
}

export function getRedisClient(): Redis | null {
    return redis;
}
