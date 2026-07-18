import type { Registry } from "@agent-eval-bench/core";
import { fileExists, fileContains, fileAbsent } from "./fs.js";
import { commandExitCode, testsPass, lintPasses, typecheckPasses } from "./command.js";
import { gitLogContains, gitBranch, gitCommitCount } from "./git.js";
import { responseContains, asksClarification, noHallucinatedPaths } from "./response.js";
import { maxToolCalls, maxCost, noLoopDetected, maxShellCommands } from "./telemetry.js";

export const builtinValidators = [
  fileExists,
  fileContains,
  fileAbsent,
  commandExitCode,
  testsPass,
  lintPasses,
  typecheckPasses,
  gitLogContains,
  gitBranch,
  gitCommitCount,
  responseContains,
  asksClarification,
  noHallucinatedPaths,
  maxToolCalls,
  maxCost,
  noLoopDetected,
  maxShellCommands,
];

export function registerBuiltinValidators(registry: Registry): void {
  for (const v of builtinValidators) {
    registry.registerValidator(v);
  }
}

export {
  fileExists,
  fileContains,
  fileAbsent,
  commandExitCode,
  testsPass,
  lintPasses,
  typecheckPasses,
  gitLogContains,
  gitBranch,
  gitCommitCount,
  responseContains,
  asksClarification,
  noHallucinatedPaths,
  maxToolCalls,
  maxCost,
  noLoopDetected,
  maxShellCommands,
};
