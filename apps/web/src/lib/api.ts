import { API_URL } from "./config";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.token) headers.set("Authorization", `Bearer ${init.token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? res.statusText);
  }
  return data as T;
}

export type MeResponse = {
  user: { id: string; email: string; name: string; image?: string | null };
  via: "session" | "api_token";
};

export type RunListItem = {
  id: string;
  clientRunId: string;
  agentName: string;
  agentVersion: string | null;
  status: string;
  scoreCard: { overall?: number; [key: string]: unknown };
  metrics: Record<string, number>;
  startedAt: string;
  completedAt: string;
  createdAt: string;
  _count: { benchmarks: number; events: number };
};

export type BenchmarkRow = {
  id: string;
  benchmarkId: string;
  name: string;
  category: string;
  difficulty: string;
  agentName: string;
  passed: boolean;
  skipped: boolean;
  skipReason: string | null;
  scoreCard: { overall?: number; [key: string]: unknown };
  metrics: Record<string, number>;
  durationMs: number;
  error: string | null;
  validatorResults: Array<{
    name: string;
    passed: boolean;
    score: number;
    message: string;
  }>;
};

export type RunDetail = RunListItem & {
  raw: unknown;
  benchmarks: BenchmarkRow[];
};

export type TelemetryRow = {
  id: string;
  clientEventId: string;
  seq: number;
  type: string;
  timestamp: string;
  benchmarkId: string | null;
  agentName: string | null;
  payload: unknown;
  durationMs: number | null;
};

export type LeaderboardRow = {
  agentName: string;
  runs: number;
  avgOverall: number;
  bestOverall: number;
  lastRunAt: string;
};
