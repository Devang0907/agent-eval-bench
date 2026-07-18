/** Configuration for bundling dist/index.d.ts (see scripts/build.ts). */
module.exports = {
  compilationOptions: {
    preferredConfigPath: "./tsconfig.dts.json",
  },
  entries: [
    {
      filePath: "./src/index.ts",
      outFile: "./dist/index.d.ts",
      noCheck: true,
      libraries: {
        inlinedLibraries: [
          "@agent-eval-bench/core",
          "@agent-eval-bench/adapters",
          "@agent-eval-bench/benchmarks",
          "@agent-eval-bench/reporter",
          "@agent-eval-bench/runner",
          "@agent-eval-bench/sandbox",
          "@agent-eval-bench/scoring",
          "@agent-eval-bench/telemetry",
        ],
      },
      output: {
        noBanner: true,
        exportReferencedTypes: false,
      },
    },
  ],
};
