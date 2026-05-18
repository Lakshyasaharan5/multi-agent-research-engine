import { cosineSimilarity, embed } from "ai";
import openai from "./ai";
import { redis } from "./redis";
import type { EngineState } from "../schemas/state.schema";

type SemanticCacheEntry = {
    id: string;
    query: string;
    embedding: number[];
    state: EngineState;
    createdAt: string;
};

type SemanticCacheHit = {
    state: EngineState;
    similarity: number;
    matchedQuery: string;
};

export class RedisSemanticCache {
    private readonly indexKey = "semantic-cache:index";

    constructor(
        private readonly threshold = 0.82,
        private readonly ttlSeconds = 24 * 60 * 60,
    ) {}

    private async createEmbedding(query: string): Promise<number[]> {
        const result = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: query,
        });

        return result.embedding;
    }

    async findSimilar(query: string): Promise<SemanticCacheHit | null> {
        const ids = await redis.lrange(this.indexKey, 0, -1);

        if (ids.length === 0) {
            return null;
        }

        const queryEmbedding = await this.createEmbedding(query);

        let bestHit: SemanticCacheHit | null = null;

        for (const id of ids) {
            const rawEntry = await redis.get(`semantic-cache:entry:${id}`);

            if (!rawEntry) {
                await redis.lrem(this.indexKey, 0, id);
                continue;
            }

            const entry = JSON.parse(rawEntry) as SemanticCacheEntry;

            const similarity = cosineSimilarity(queryEmbedding, entry.embedding);

            if (!bestHit || similarity > bestHit.similarity) {
                bestHit = {
                    state: entry.state,
                    similarity,
                    matchedQuery: entry.query,
                };
            }
        }

        if (!bestHit || bestHit.similarity < this.threshold) {
            return null;
        }

        return bestHit;
    }

    async set(query: string, state: EngineState): Promise<void> {
        const embedding = await this.createEmbedding(query);
        const id = crypto.randomUUID();

        const entry: SemanticCacheEntry = {
            id,
            query,
            embedding,
            state,
            createdAt: new Date().toISOString(),
        };

        await redis.set(`semantic-cache:entry:${id}`, JSON.stringify(entry), "EX", this.ttlSeconds);

        await redis.rpush(this.indexKey, id);
        await redis.expire(this.indexKey, this.ttlSeconds);
    }

    async clear(): Promise<void> {
        const ids = await redis.lrange(this.indexKey, 0, -1);

        if (ids.length > 0) {
            await redis.del(...ids.map((id) => `semantic-cache:entry:${id}`));
        }

        await redis.del(this.indexKey);
    }
}

export const semanticCache = new RedisSemanticCache();
