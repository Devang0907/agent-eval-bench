import { createHash, randomBytes } from "node:crypto";

export function generateApiToken(): { token: string; prefix: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  const token = `aeb_${raw}`;
  return {
    token,
    prefix: token.slice(0, 12),
    hash: hashToken(token),
  };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateDeviceCodes(): { deviceCode: string; userCode: string } {
  const deviceCode = randomBytes(32).toString("base64url");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let userCode = "";
  const bytes = randomBytes(8);
  for (let i = 0; i < 8; i++) {
    userCode += alphabet[bytes[i]! % alphabet.length]!;
    if (i === 3) userCode += "-";
  }
  return { deviceCode, userCode };
}
