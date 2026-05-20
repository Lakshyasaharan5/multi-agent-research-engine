import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { runResearchEngine } from "./engine/runResearchEngine.js";
import { createResearchZip } from "./lib/createZip.js";
import { initRedis } from "./cache/redis.js";

initRedis();

const app = new Hono();

app.get("/", (c) => {
    return c.json({
        status: "ok",
        message: "Multi-agent research engine is running",
    });
});

app.post("/api/research", async (c) => {
    const body = await c.req.json<{ query?: string }>();

    if (!body.query || body.query.trim().length === 0) {
        return c.json(
            {
                error: "Query is required",
            },
            400,
        );
    }

    const result = await runResearchEngine(body.query);

    const zipBuffer = await createResearchZip({
        state: result.state,
        logs: result.logs,
    });

    return new Response(new Uint8Array(zipBuffer), {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": 'attachment; filename="research-output.zip"',
        },
    });
});

serve({
    fetch: app.fetch,
    hostname: "0.0.0.0",
    port: Number(process.env.PORT ?? 3000),
});

console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
