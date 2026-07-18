import type { Env } from "../env.js";

export function corsHeaders(env: Env, request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const allowed =
    origin === env.WEB_ORIGIN || origin === env.API_ORIGIN ? origin : env.WEB_ORIGIN;

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
    "Access-Control-Expose-Headers": "Set-Cookie",
    Vary: "Origin",
  };
}

export function withCors(env: Env, request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(env, request))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
