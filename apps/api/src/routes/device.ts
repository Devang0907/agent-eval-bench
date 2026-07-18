import { z } from "zod";
import type { Auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { generateApiToken, generateDeviceCodes } from "../lib/tokens.js";
import { error, json, resolveAuth } from "../middleware/auth.js";
import type { Env } from "../env.js";

const ApproveSchema = z.object({
  userCode: z.string().min(4),
});

const TokenPollSchema = z.object({
  deviceCode: z.string().min(8),
});

export async function handleDeviceRoutes(
  request: Request,
  url: URL,
  auth: Auth,
  env: Env,
): Promise<Response | null> {
  if (url.pathname === "/v1/device/code" && request.method === "POST") {
    const { deviceCode, userCode } = generateDeviceCodes();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.deviceCode.create({
      data: {
        deviceCode,
        userCode,
        expiresAt,
        interval: 5,
      },
    });

    const verificationUri = `${env.WEB_ORIGIN}/device`;
    const verificationUriComplete = `${verificationUri}?code=${encodeURIComponent(userCode)}`;

    return json({
      deviceCode,
      userCode,
      verificationUri,
      verificationUriComplete,
      expiresIn: 15 * 60,
      interval: 5,
    });
  }

  if (url.pathname === "/v1/device/token" && request.method === "POST") {
    const body = TokenPollSchema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) return error(400, "Invalid body");

    const record = await prisma.deviceCode.findUnique({
      where: { deviceCode: body.data.deviceCode },
    });
    if (!record) return error(400, "invalid_grant", { errorCode: "invalid_grant" });
    if (record.consumedAt) return error(400, "invalid_grant", { errorCode: "invalid_grant" });
    if (record.expiresAt.getTime() < Date.now()) {
      return error(400, "expired_token", { errorCode: "expired_token" });
    }
    if (!record.approvedAt || !record.userId) {
      return json({ error: "authorization_pending", errorCode: "authorization_pending" }, { status: 400 });
    }

    const { token, prefix, hash } = generateApiToken();
    await prisma.$transaction([
      prisma.apiToken.create({
        data: {
          userId: record.userId,
          name: "CLI device login",
          tokenHash: hash,
          tokenPrefix: prefix,
        },
      }),
      prisma.deviceCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: record.userId } });

    return json({
      accessToken: token,
      tokenType: "Bearer",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  }

  if (url.pathname === "/v1/device/approve" && request.method === "POST") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx || ctx.via !== "session") return error(401, "Sign in required");

    const body = ApproveSchema.safeParse(await request.json().catch(() => ({})));
    if (!body.success) return error(400, "Invalid body");

    const normalized = body.data.userCode.trim().toUpperCase().replace(/\s+/g, "");
    const record = await prisma.deviceCode.findFirst({
      where: {
        OR: [{ userCode: normalized }, { userCode: body.data.userCode.trim() }],
        consumedAt: null,
      },
    });

    if (!record) return error(404, "Unknown or expired code");
    if (record.expiresAt.getTime() < Date.now()) return error(400, "Code expired");
    if (record.approvedAt) return error(400, "Code already approved");

    await prisma.deviceCode.update({
      where: { id: record.id },
      data: {
        userId: ctx.user.id,
        approvedAt: new Date(),
      },
    });

    return json({ ok: true });
  }

  return null;
}
