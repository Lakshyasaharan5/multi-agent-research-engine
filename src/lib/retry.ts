import type { Logger } from "./logger";

type RetryContext = {
    step: string;
};

export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 1,
    logger: Logger,
    context: RetryContext,
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";

        logger.error("Operation failed", {
            step: context.step,
            retriesLeft: retries,
            error: message,
        });

        if (retries <= 0) {
            throw error;
        }

        return withRetry(fn, retries - 1, logger, context);
    }
}
