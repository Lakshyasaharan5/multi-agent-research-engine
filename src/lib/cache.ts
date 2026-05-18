import { redis } from "./redis";

export class RedisCache {
    async get<T>(key: string): Promise<T | null> {
        const value = await redis.get(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value) as T;
    }

    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
        await redis.set(key, JSON.stringify(value), "PX", ttlMs);
    }

    async delete(key: string): Promise<void> {
        await redis.del(key);
    }

    async clear(): Promise<void> {
        await redis.flushdb();
    }
}

export const cache = new RedisCache();
