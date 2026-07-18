import type { Auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { hashToken } from "../lib/tokens.js";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export type AuthContext = {
  user: AuthUser;
  via: "session" | "api_token";
  tokenId?: string;
};

export async function resolveAuth(
  request: Request,
  auth: Auth,
): Promise<AuthContext | null> {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token.startsWith("aeb_")) {
      const tokenHash = hashToken(token);
      const record = await prisma.apiToken.findFirst({
        where: { tokenHash, revokedAt: null },
        include: { user: true },
      });
      if (record) {
        await prisma.apiToken.update({
          where: { id: record.id },
          data: { lastUsedAt: new Date() },
        });
        return {
          user: {
            id: record.user.id,
            email: record.user.email,
            name: record.user.name,
            image: record.user.image,
          },
          via: "api_token",
          tokenId: record.id,
        };
      }
    }
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
    via: "session",
  };
}

export function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export function error(status: number, message: string, extra?: Record<string, unknown>): Response {
  return json({ error: message, ...extra }, { status });
}
