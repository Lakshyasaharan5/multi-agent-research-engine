import { embed, cosineSimilarity } from "ai";
import openai from "./ai";
import type { EngineState } from "../schemas/state.schema";

type SemanticCacheEntry = {
    query: string;
    embedding: number[];
    state: EngineState;
    createdAt: string;
    expiresAt: number;
};

type SemanticCacheHit = {
    state: EngineState;
    similarity: number;
    matchedQuery: string;
};

export class SemanticCache {
    private entries: SemanticCacheEntry[] = [];

    constructor(
        private readonly threshold = 0.82,
        private readonly ttlMs = 24 * 60 * 60 * 1000,
    ) {}

    private async createEmbedding(query: string): Promise<number[]> {
        const result = await embed({
            model: openai.embedding("text-embedding-3-small"),
            value: query,
        });

        return result.embedding;
    }

    async findSimilar(query: string): Promise<SemanticCacheHit | null> {
        this.removeExpiredEntries();

        if (this.entries.length === 0) {
            return null;
        }

        const queryEmbedding = await this.createEmbedding(query);

        let bestMatch: SemanticCacheHit | null = null;

        for (const entry of this.entries) {
            const similarity = cosineSimilarity(queryEmbedding, entry.embedding);

            if (!bestMatch || similarity > bestMatch.similarity) {
                bestMatch = {
                    state: entry.state,
                    similarity,
                    matchedQuery: entry.query,
                };
            }
        }

        if (!bestMatch || bestMatch.similarity < this.threshold) {
            return null;
        }

        return bestMatch;
    }

    async set(query: string, state: EngineState): Promise<void> {
        const embedding = await this.createEmbedding(query);

        this.entries.push({
            query,
            embedding,
            state,
            createdAt: new Date().toISOString(),
            expiresAt: Date.now() + this.ttlMs,
        });
    }

    private removeExpiredEntries(): void {
        const now = Date.now();
        this.entries = this.entries.filter((entry) => entry.expiresAt > now);
    }

    clear(): void {
        this.entries = [];
    }
}

export const semanticCache = new SemanticCache();
