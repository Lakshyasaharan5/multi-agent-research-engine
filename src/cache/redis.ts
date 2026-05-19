import { Redis } from "ioredis";
import type { RedisOptions } from "ioredis";

let redis: Redis | null = null;

export function initRedis(): void {
    if (!process.env.REDIS_URL) {
        console.warn("REDIS_URL not set. Cache disabled.");
        return;
    }

    if (redis) return;

    const options: RedisOptions = {
        maxRetriesPerRequest: 0,
        enableOfflineQueue: false,
        retryStrategy: () => null,
        lazyConnect: false,
    };

    const client = new Redis(process.env.REDIS_URL, options);

    client.on("connect", () => {
        console.log("Redis connected");
    });

    client.on("error", (err: Error) => {
        console.error("Redis error", err);
    });

    redis = client;
}

export function getRedis(): Redis | null {
    return redis;
}
