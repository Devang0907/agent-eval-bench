import { loadEnv } from "./env.js";
import { createAuth } from "./lib/auth.js";
import { withCors } from "./routes/cors.js";
import { handleDeviceRoutes } from "./routes/device.js";
import { handleMeRoutes } from "./routes/me.js";
import { handleRunsRoutes } from "./routes/runs.js";
import { json } from "./middleware/auth.js";

const env = loadEnv();
const auth = createAuth(env);

const server = Bun.serve({
  port: env.PORT,
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return withCors(env, request, new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/health" && request.method === "GET") {
        return withCors(env, request, json({ ok: true, service: "agent-eval-bench-api" }));
      }

      if (url.pathname.startsWith("/api/auth")) {
        const response = await auth.handler(request);
        return withCors(env, request, response);
      }

      const device = await handleDeviceRoutes(request, url, auth, env);
      if (device) return withCors(env, request, device);

      const me = await handleMeRoutes(request, url, auth);
      if (me) return withCors(env, request, me);

      const runs = await handleRunsRoutes(request, url, auth);
      if (runs) return withCors(env, request, runs);

      return withCors(env, request, json({ error: "Not found" }, { status: 404 }));
    } catch (err) {
      console.error(err);
      return withCors(
        env,
        request,
        json(
          { error: err instanceof Error ? err.message : "Internal server error" },
          { status: 500 },
        ),
      );
    }
  },
});

console.log(`@agent-eval-bench/api listening on ${env.API_ORIGIN} (port ${server.port})`);
