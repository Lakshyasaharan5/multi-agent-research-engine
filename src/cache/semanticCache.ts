import { cosineSimilarity, embed } from "ai";
import openai from "../lib/ai.js";
import { getRedis } from "./redis.js";
import type { EngineState } from "../schemas/state.schema.js";
import { Logger } from "../lib/logger.js";

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

export class SemanticCache {
    private readonly indexKey = "semantic-cache:index";
    private readonly threshold = 0.82;
    private readonly ttlSeconds = Number(process.env.SEMANTIC_CACHE_TTL_S) || 24 * 60 * 60;

    constructor(private readonly logger: Logger) {}

    private async createEmbedding(query: string): Promise<number[]> {
        const result = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: query,
        });

        return result.embedding;
    }

    async findSimilar(query: string): Promise<SemanticCacheHit | null> {
        const redis = getRedis();

        if (!redis) {
            return null;
        }

        try {
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
        } catch {
            return null;
        }
    }

    async set(query: string, state: EngineState): Promise<void> {
        const redis = getRedis();

        if (!redis) {
            return;
        }

        try {
            const embedding = await this.createEmbedding(query);
            const id = crypto.randomUUID();

            const entry: SemanticCacheEntry = {
                id,
                query,
                embedding,
                state,
                createdAt: new Date().toISOString(),
            };

            await redis.set(
                `semantic-cache:entry:${id}`,
                JSON.stringify(entry),
                "EX",
                this.ttlSeconds,
            );

            await redis.rpush(this.indexKey, id);
            await redis.expire(this.indexKey, this.ttlSeconds);
            this.logger.info("Stored result in semantic cache", { entryQuery: entry.query });
        } catch {
            // don't fail the request if cache fails
        }
    }

    async clear(): Promise<void> {
        const redis = getRedis();

        if (!redis) {
            return;
        }

        try {
            const ids = await redis.lrange(this.indexKey, 0, -1);

            if (ids.length > 0) {
                await redis.del(...ids.map((id: any) => `semantic-cache:entry:${id}`));
            }

            await redis.del(this.indexKey);
        } catch {
            // don't fail the request if cache fails
        }
    }
}
