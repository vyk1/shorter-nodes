import fastify from "fastify";
import { z } from 'zod';
import postgres from "postgres";
import { sql } from "./lib/postgres";
import { redis } from "./lib/redis";

const app = fastify({ logger: true });

app.get("/:code", async (request, reply) => {

    const getLinkSchema = z.object({
        code: z.string().min(3),
    });

    const { code } = getLinkSchema.parse(request.params);

    const res = await sql`SELECT id, original_url FROM shorter_links WHERE shorter_links.code = ${code}`;
    if (res.length === 0) {
        reply.status(404).send({ error: "Link not found" });
        return;
    }

    await redis.zIncrBy('metrics', 1, String(res[0].id));

    return reply.redirect(301, res[0].original_url);
})

app.get("/api/links", async (request, reply) => {
    const links = await sql`SELECT * FROM shorter_links ORDER BY created_at DESC`;
    return links;
})

app.post("/api/links", async (request, reply) => {
    try {
        const createLinkSchema = z.object({
            code: z.string().min(3),
            url: z.string().url(),
        });
        const { code, url } = createLinkSchema.parse(request.body);

        const res = await sql
            `INSERT INTO shorter_links (code, original_url) VALUES (${code}, ${url})
            RETURNING id
            `
        const link = res[0];
        return reply.status(201).send({ shorterLinkId: link.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            reply.status(400).send({ error: error.errors });
            return;
        }
        if (error instanceof postgres.PostgresError) {
            if (error.code === '23505') {
                reply.status(400).send({ error: 'Code already in use' });
                return;
            }
            reply.status(400).send({ error: error.message });
            return;
        }

    }
})

app.get("/api/metrics", async (request, reply) => {
    const res = await redis.zRangeByScoreWithScores('metrics', 0, 50)

    const metrics = res.sort((a, b) => b.score - a.score)
        .map((el) => {
            return { shorterLinkId: Number(el.value), clicks: el.score }
        })
    return metrics;
})

app.get("/", async (request, reply) => {
    return { hello: "world" };
});

app.listen({
    port: 3333,
}).then(() => {
    console.log("Server is running at http://localhost:3333");
});