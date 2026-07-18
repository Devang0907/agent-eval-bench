import type { RunResult, TelemetryEvent } from "@agent-eval-bench/core";
import { clearCredentials, defaultApiUrl, loadCredentials, type CloudCredentials } from "./credentials.js";

async function request<T>(
  path: string,
  init?: RequestInit & { token?: string; apiUrl?: string },
): Promise<T> {
  const apiUrl = init?.apiUrl ?? defaultApiUrl();
  const headers = new Headers(init?.headers);
  if (init?.token) headers.set("Authorization", `Bearer ${init.token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${apiUrl}${path}`, { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; errorCode?: string };
  if (!res.ok) {
    const err = new Error(data.error ?? res.statusText) as Error & { status: number; errorCode?: string };
    err.status = res.status;
    err.errorCode = data.errorCode;
    throw err;
  }
  return data;
}

export async function startDeviceLogin(apiUrl = defaultApiUrl()) {
  return request<{
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    verificationUriComplete: string;
    expiresIn: number;
    interval: number;
  }>("/v1/device/code", { method: "POST", body: "{}", apiUrl });
}

export async function pollDeviceToken(deviceCode: string, apiUrl = defaultApiUrl()) {
  return request<{
    accessToken?: string;
    user?: CloudCredentials["user"];
    error?: string;
    errorCode?: string;
  }>("/v1/device/token", {
    method: "POST",
    body: JSON.stringify({ deviceCode }),
    apiUrl,
  });
}

export async function whoami(creds?: CloudCredentials | null) {
  const c = creds ?? (await loadCredentials());
  if (!c) throw new Error("Not logged in. Run: agent-eval-bench login");
  return request<{ user: CloudCredentials["user"]; via: string }>("/v1/me", {
    token: c.accessToken,
    apiUrl: c.apiUrl,
  });
}

export async function logoutCloud(): Promise<void> {
  const c = await loadCredentials();
  if (c) {
    try {
      await request("/v1/me/logout-cli", {
        method: "POST",
        token: c.accessToken,
        apiUrl: c.apiUrl,
      });
    } catch {
      // still clear local
    }
  }
  await clearCredentials();
}

export async function syncRun(
  result: RunResult,
  events: readonly TelemetryEvent[] = [],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const creds = await loadCredentials();
  if (!creds) return { ok: false, reason: "not_logged_in" };

  try {
    await request("/v1/runs", {
      method: "POST",
      token: creds.accessToken,
      apiUrl: creds.apiUrl,
      body: JSON.stringify(result),
    });

    const batchSize = 100;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      if (batch.length === 0) continue;
      await request(`/v1/runs/${encodeURIComponent(result.runId)}/events`, {
        method: "POST",
        token: creds.accessToken,
        apiUrl: creds.apiUrl,
        body: JSON.stringify({ events: batch }),
      });
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "sync_failed",
    };
  }
}
