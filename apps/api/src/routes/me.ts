import type { Auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { generateApiToken } from "../lib/tokens.js";
import { error, json, resolveAuth } from "../middleware/auth.js";
import { z } from "zod";

const CreateTokenSchema = z.object({
  name: z.string().min(1).max(80).default("Personal token"),
});

export async function handleMeRoutes(
  request: Request,
  url: URL,
  auth: Auth,
): Promise<Response | null> {
  if (url.pathname === "/v1/me" && request.method === "GET") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx) return error(401, "Unauthorized");
    return json({ user: ctx.user, via: ctx.via });
  }

  if (url.pathname === "/v1/me/tokens" && request.method === "GET") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx || ctx.via !== "session") return error(401, "Sign in required");

    const tokens = await prisma.apiToken.findMany({
      where: { userId: ctx.user.id, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
    return json({ tokens });
  }

  if (url.pathname === "/v1/me/tokens" && request.method === "POST") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx || ctx.via !== "session") return error(401, "Sign in required");

    const body = CreateTokenSchema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) return error(400, "Invalid body");

    const { token, prefix, hash } = generateApiToken();
    const created = await prisma.apiToken.create({
      data: {
        userId: ctx.user.id,
        name: body.data.name,
        tokenHash: hash,
        tokenPrefix: prefix,
      },
    });

    return json({
      token: {
        id: created.id,
        name: created.name,
        tokenPrefix: created.tokenPrefix,
        createdAt: created.createdAt,
      },
      accessToken: token,
    });
  }

  const revokeMatch = url.pathname.match(/^\/v1\/me\/tokens\/([^/]+)$/);
  if (revokeMatch && request.method === "DELETE") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx || ctx.via !== "session") return error(401, "Sign in required");

    const id = revokeMatch[1]!;
    const existing = await prisma.apiToken.findFirst({
      where: { id, userId: ctx.user.id, revokedAt: null },
    });
    if (!existing) return error(404, "Token not found");

    await prisma.apiToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
    return json({ ok: true });
  }

  if (url.pathname === "/v1/me/logout-cli" && request.method === "POST") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx || ctx.via !== "api_token" || !ctx.tokenId) {
      return error(401, "API token required");
    }
    await prisma.apiToken.update({
      where: { id: ctx.tokenId },
      data: { revokedAt: new Date() },
    });
    return json({ ok: true });
  }

  return null;
}
