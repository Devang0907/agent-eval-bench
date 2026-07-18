import chalk from "chalk";
import { logoutCloud } from "../cloud/client.js";

export async function logoutCommand(): Promise<void> {
  await logoutCloud();
  console.log(chalk.green("Logged out. Local credentials cleared."));
}
