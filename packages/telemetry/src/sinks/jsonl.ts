import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { EventBus, TelemetryEvent } from "@agent-eval-bench/core";

/** Append-only JSONL event sink */
export class JsonlSink {
  private unsubscribe: (() => void) | null = null;
  private readonly buffer: string[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly bus: EventBus,
    private readonly path: string,
  ) {}

  async start(): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    this.unsubscribe = this.bus.on("*", (event) => {
      this.buffer.push(JSON.stringify(event));
    });
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, 500);
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const chunk = this.buffer.splice(0).join("\n") + "\n";
    await Bun.write(this.path, (await this.readExisting()) + chunk);
  }

  private async readExisting(): Promise<string> {
    try {
      return await Bun.file(this.path).text();
    } catch {
      return "";
    }
  }

  async stop(): Promise<void> {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.unsubscribe?.();
    await this.flush();
  }

  async readAll(): Promise<TelemetryEvent[]> {
    try {
      const text = await Bun.file(this.path).text();
      return text
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l) as TelemetryEvent);
    } catch {
      return [];
    }
  }
}
