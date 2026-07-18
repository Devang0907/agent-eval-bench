import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import type { Env } from "../env.js";

export function createAuth(env: Env) {
  const socialProviders =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined;

  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    secret: env.BETTER_AUTH_SECRET,
    // Browser hits the web origin; Next.js rewrites proxy /api/auth and /v1 to this API.
    baseURL: env.WEB_ORIGIN,
    trustedOrigins: [env.WEB_ORIGIN, env.API_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    socialProviders,
    advanced: {
      crossSubDomainCookies: {
        enabled: false,
      },
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: env.WEB_ORIGIN.startsWith("https"),
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
