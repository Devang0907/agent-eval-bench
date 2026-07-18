import { Listr } from "listr2";
import { execa } from "execa";
import chalk from "chalk";
import { access } from "node:fs/promises";
import { constants } from "node:fs";

async function checkCmd(cmd: string, args: string[]): Promise<{ ok: boolean; detail: string }> {
  try {
    const r = await execa(cmd, args, { reject: false, timeout: 15_000 });
    return {
      ok: r.exitCode === 0,
      detail: (r.stdout || r.stderr || "").trim().split("\n")[0] ?? "",
    };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

export async function doctorCommand(): Promise<void> {
  const tasks = new Listr(
    [
      {
        title: "Bun",
        async task(ctx, task) {
          const r = await checkCmd("bun", ["--version"]);
          if (!r.ok) throw new Error("Bun not found");
          task.title = `Bun ${r.detail}`;
        },
      },
      {
        title: "Node",
        async task(ctx, task) {
          const r = await checkCmd("node", ["--version"]);
          task.title = r.ok ? `Node ${r.detail}` : "Node not found (optional)";
        },
      },
      {
        title: "Git",
        async task(ctx, task) {
          const r = await checkCmd("git", ["--version"]);
          if (!r.ok) throw new Error("Git not found");
          task.title = r.detail;
        },
      },
      {
        title: "Docker",
        async task(ctx, task) {
          const r = await checkCmd("docker", ["info"]);
          if (!r.ok) {
            task.title = "Docker unavailable (local sandbox still works with --no-docker)";
            return;
          }
          task.title = "Docker available";
        },
      },
      {
        title: "Write permissions",
        async task() {
          const test = `.agent-eval-bench-doctor-${Date.now()}`;
          await Bun.write(test, "ok");
          await access(test, constants.W_OK);
          const { unlink } = await import("node:fs/promises");
          await unlink(test);
        },
      },
      {
        title: "Adapters",
        async task(ctx, task) {
          const checks = [
            ["claude", "claude", ["--version"]],
            ["codex", "codex", ["--version"]],
            ["opencode", "opencode", ["--version"]],
          ] as const;
          const found: string[] = ["mock"];
          for (const [name, cmd, args] of checks) {
            const r = await checkCmd(cmd, [...args]);
            if (r.ok) found.push(name);
          }
          task.title = `Adapters available: ${found.join(", ")}`;
        },
      },
    ],
    { concurrent: false, exitOnError: false },
  );

  await tasks.run();
  console.log(chalk.green("\nDoctor complete.\n"));
}
