import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const outdir = join(import.meta.dir, "..", "dist");
await mkdir(outdir, { recursive: true });

await Bun.build({
  entrypoints: [join(import.meta.dir, "..", "src", "bin.ts")],
  outdir,
  target: "bun",
  naming: "bin.js",
  external: [
    "react",
    "ink",
    "yoga-wasm-web",
  ],
});

// Write a small launcher
await Bun.write(
  join(outdir, "cli.js"),
  `#!/usr/bin/env bun\nimport "./bin.js";\n`,
);

console.log("Built packages/cli/dist");
