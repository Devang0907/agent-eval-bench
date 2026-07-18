import chalk from "chalk";
import { loadCredentials } from "../cloud/credentials.js";
import { whoami } from "../cloud/client.js";

export async function whoamiCommand(): Promise<void> {
  const creds = await loadCredentials();
  if (!creds) {
    console.log(chalk.yellow("Not logged in."));
    console.log(chalk.dim("Run: agent-eval-bench login"));
    process.exitCode = 1;
    return;
  }

  try {
    const me = await whoami(creds);
    console.log(chalk.bold(me.user.name));
    console.log(me.user.email);
    console.log(chalk.dim(`API ${creds.apiUrl}`));
  } catch (err) {
    console.error(chalk.red(err instanceof Error ? err.message : "Failed to fetch profile"));
    console.log(chalk.dim("Try logging in again: agent-eval-bench login"));
    process.exitCode = 1;
  }
}
