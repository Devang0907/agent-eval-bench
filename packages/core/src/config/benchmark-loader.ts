import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import {
  BenchmarkDefinitionSchema,
  type BenchmarkDefinition,
} from "../schemas/benchmark.js";
import { BenchmarkError } from "../errors/index.js";

/**
 * Load a single benchmark from a YAML or JSON file.
 * YAML is parsed via Bun's native YAML support (Bun.YAML) when available,
 * falling back to a minimal YAML→JSON path.
 */
export async function loadBenchmarkFile(path: string): Promise<BenchmarkDefinition> {
  const text = await Bun.file(path).text();
  const ext = extname(path).toLowerCase();

  let raw: unknown;
  if (ext === ".json") {
    raw = JSON.parse(text);
  } else if (ext === ".yaml" || ext === ".yml") {
    raw = parseYaml(text);
  } else {
    throw new BenchmarkError(`Unsupported benchmark file extension: ${ext}`, { path });
  }

  const result = BenchmarkDefinitionSchema.safeParse(raw);
  if (!result.success) {
    throw new BenchmarkError(`Invalid benchmark definition in ${path}`, {
      path,
      issues: result.error.issues,
    });
  }
  return result.data;
}

/** Recursively load all .yaml/.yml/.json benchmarks from a directory */
export async function loadBenchmarksFromDir(
  dir: string,
): Promise<BenchmarkDefinition[]> {
  const results: BenchmarkDefinition[] = [];
  walkDir(dir, (file) => {
    const ext = extname(file).toLowerCase();
    if (ext === ".yaml" || ext === ".yml" || ext === ".json") {
      results.push(file as unknown as BenchmarkDefinition);
    }
  });

  // Actually load them (walk collected paths as strings)
  const paths = collectFiles(dir);
  const benchmarks: BenchmarkDefinition[] = [];
  for (const p of paths) {
    benchmarks.push(await loadBenchmarkFile(p));
  }
  return benchmarks;
}

function collectFiles(dir: string): string[] {
  const out: string[] = [];
  walkDir(dir, (file) => {
    const ext = extname(file).toLowerCase();
    if (ext === ".yaml" || ext === ".yml" || ext === ".json") {
      out.push(file);
    }
  });
  return out;
}

function walkDir(dir: string, cb: (file: string) => void): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    try {
      const st = statSync(full);
      if (st.isDirectory()) {
        walkDir(full, cb);
      } else if (st.isFile()) {
        cb(full);
      }
    } catch {
      // skip inaccessible
    }
  }
}

/**
 * Minimal YAML parser for our subset (maps, lists, scalars).
 * Prefer Bun.YAML when available.
 */
function parseYaml(text: string): unknown {
  // Bun 1.1+ has Bun.YAML
  const bunYaml = (Bun as unknown as { YAML?: { parse: (s: string) => unknown } }).YAML;
  if (bunYaml?.parse) {
    return bunYaml.parse(text);
  }

  // Fallback: try JSON if the file happens to be JSON-compatible
  try {
    return JSON.parse(text);
  } catch {
    // Very minimal line-based fallback for simple key: value YAML
    return parseSimpleYaml(text);
  }
}

function parseSimpleYaml(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = text.split("\n");
  let currentKey: string | null = null;
  let currentList: unknown[] | null = null;

  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const listMatch = line.match(/^(\s*)-\s+(.*)$/);
    if (listMatch && currentKey) {
      const val = coerce(listMatch[2] ?? "");
      if (!currentList) {
        currentList = [];
        result[currentKey] = currentList;
      }
      currentList.push(val);
      continue;
    }

    const kvMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (kvMatch) {
      currentList = null;
      currentKey = kvMatch[1] ?? null;
      const rest = (kvMatch[2] ?? "").trim();
      if (rest === "" || rest === "|" || rest === ">") {
        // multi-line or nested — store empty for now
        result[currentKey!] = rest === "" ? {} : "";
      } else {
        result[currentKey!] = coerce(rest);
      }
    }
  }
  return result;
}

function coerce(s: string): unknown {
  const t = s.trim();
  if (t === "true") return true;
  if (t === "false") return false;
  if (t === "null" || t === "~") return null;
  if (/^-?\d+$/.test(t)) return Number(t);
  if (/^-?\d+\.\d+$/.test(t)) return Number(t);
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

/** Synchronous helper used by fixtures */
export function loadBenchmarkFileSync(path: string): BenchmarkDefinition {
  const text = readFileSync(path, "utf-8");
  const ext = extname(path).toLowerCase();
  let raw: unknown;
  if (ext === ".json") {
    raw = JSON.parse(text);
  } else {
    raw = parseYaml(text);
  }
  return BenchmarkDefinitionSchema.parse(raw);
}
