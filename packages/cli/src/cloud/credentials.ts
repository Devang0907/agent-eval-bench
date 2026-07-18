import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export type CloudCredentials = {
  apiUrl: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  savedAt: string;
};

export function defaultApiUrl(): string {
  return process.env["AGENT_EVAL_BENCH_API_URL"] ?? "http://localhost:4000";
}

export function credentialsPath(): string {
  return join(homedir(), ".agent-eval-bench", "credentials.json");
}

export async function loadCredentials(): Promise<CloudCredentials | null> {
  try {
    const raw = await readFile(credentialsPath(), "utf8");
    return JSON.parse(raw) as CloudCredentials;
  } catch {
    return null;
  }
}

export async function saveCredentials(creds: CloudCredentials): Promise<void> {
  const dir = join(homedir(), ".agent-eval-bench");
  await mkdir(dir, { recursive: true });
  await writeFile(credentialsPath(), JSON.stringify(creds, null, 2), "utf8");
}

export async function clearCredentials(): Promise<void> {
  try {
    await unlink(credentialsPath());
  } catch {
    // ignore
  }
}
