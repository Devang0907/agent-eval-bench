export class AgentEvalBenchError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AgentEvalBenchError";
  }
}

export class ConfigError extends AgentEvalBenchError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "CONFIG_ERROR", details);
    this.name = "ConfigError";
  }
}

export class AdapterError extends AgentEvalBenchError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "ADAPTER_ERROR", details);
    this.name = "AdapterError";
  }
}

export class SandboxError extends AgentEvalBenchError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "SANDBOX_ERROR", details);
    this.name = "SandboxError";
  }
}

export class BenchmarkError extends AgentEvalBenchError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "BENCHMARK_ERROR", details);
    this.name = "BenchmarkError";
  }
}

export class ValidatorError extends AgentEvalBenchError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATOR_ERROR", details);
    this.name = "ValidatorError";
  }
}

export class PluginError extends AgentEvalBenchError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "PLUGIN_ERROR", details);
    this.name = "PluginError";
  }
}

export class TimeoutError extends AgentEvalBenchError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "TIMEOUT_ERROR", details);
    this.name = "TimeoutError";
  }
}
