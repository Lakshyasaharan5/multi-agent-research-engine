import { getRedisClient } from "./redis";
import { Logger } from "../lib/logger";

export class Cache {
    private readonly ttlMs = Number(process.env.CACHE_TTL_MS) || 24 * 60 * 60 * 1000;

    constructor(private readonly logger: Logger) {}

    async get<T>(key: string): Promise<T | null> {
        const redis = getRedisClient();
        if (!redis) return null;

        try {
            const value = await redis.get(key);
            if (!value) return null;
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        const redis = getRedisClient();
        if (!redis) return;

        try {
            await redis.set(key, JSON.stringify(value), "PX", this.ttlMs);
            this.logger.info("Stored result in cache", { key });
        } catch {
            // don't fail the request if cache fails
        }
    }

    async delete(key: string): Promise<void> {
        const redis = getRedisClient();
        if (!redis) return;

        try {
            await redis.del(key);
        } catch {
            // don't fail the request if cache fails
        }
    }

    async clear(): Promise<void> {
        const redis = getRedisClient();
        if (!redis) return;

        try {
            await redis.flushdb();
        } catch {
            // don't fail the request if cache fails
        }
    }
}
