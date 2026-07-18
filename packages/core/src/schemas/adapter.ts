import { z } from "zod";

/** Adapter capability flags — runner skips incompatible tests */
export const AdapterCapabilitiesSchema = z.object({
  supportsInterrupt: z.boolean().default(false),
  supportsResume: z.boolean().default(false),
  supportsMcp: z.boolean().default(false),
  supportsStreaming: z.boolean().default(false),
  supportsToolCalls: z.boolean().default(true),
  supportsMultiTurn: z.boolean().default(true),
  supportsFiles: z.boolean().default(true),
  supportsShell: z.boolean().default(true),
});
export type AdapterCapabilities = z.infer<typeof AdapterCapabilitiesSchema>;

/** Agent adapter configuration */
export const AdapterConfigSchema = z.object({
  name: z.string(),
  type: z.enum([
    "cli",
    "http",
    "mcp",
    "openai",
    "openrouter",
    "codex",
    "claude-code",
    "opencode",
    "mock",
    "custom",
  ]),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  headers: z.record(z.string()).optional(),
  timeout: z.number().positive().optional(),
  env: z.record(z.string()).optional(),
  capabilities: AdapterCapabilitiesSchema.optional(),
  options: z.record(z.unknown()).optional(),
});
export type AdapterConfig = z.infer<typeof AdapterConfigSchema>;
