import chalk from "chalk";
import { defaultApiUrl, saveCredentials } from "../cloud/credentials.js";
import { pollDeviceToken, startDeviceLogin } from "../cloud/client.js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loginCommand(): Promise<void> {
  const apiUrl = defaultApiUrl();
  console.log(chalk.dim(`Using API ${apiUrl}`));

  const started = await startDeviceLogin(apiUrl);
  console.log();
  console.log(chalk.bold("Link your CLI to Agent Eval Bench"));
  console.log();
  console.log(`  Open:  ${chalk.cyan(started.verificationUriComplete)}`);
  console.log(`  Code:  ${chalk.bold.yellow(started.userCode)}`);
  console.log();
  console.log(chalk.dim("Waiting for approval…"));

  const deadline = Date.now() + started.expiresIn * 1000;
  let intervalMs = Math.max(started.interval, 3) * 1000;

  while (Date.now() < deadline) {
    await sleep(intervalMs);
    try {
      const res = await pollDeviceToken(started.deviceCode, apiUrl);
      if (res.accessToken && res.user) {
        await saveCredentials({
          apiUrl,
          accessToken: res.accessToken,
          user: res.user,
          savedAt: new Date().toISOString(),
        });
        console.log();
        console.log(chalk.green(`Logged in as ${res.user.email}`));
        return;
      }
    } catch (err) {
      const e = err as Error & { errorCode?: string; status?: number };
      if (e.errorCode === "authorization_pending" || e.message === "authorization_pending") {
        continue;
      }
      if (e.errorCode === "slow_down") {
        intervalMs += 2000;
        continue;
      }
      if (e.errorCode === "expired_token") {
        console.error(chalk.red("Device code expired. Run login again."));
        process.exitCode = 1;
        return;
      }
      console.error(chalk.red(e.message));
      process.exitCode = 1;
      return;
    }
  }

  console.error(chalk.red("Timed out waiting for approval."));
  process.exitCode = 1;
}
