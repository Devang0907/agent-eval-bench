/**
 * Minimal ambient declaration for `bun:sqlite`, used only when running under
 * Bun. Keeps the workspace typecheckable with @types/node alone.
 */
declare module "bun:sqlite" {
  export class Database {
    constructor(path: string);
    query(sql: string): {
      all(params?: unknown): unknown[];
      get(params?: unknown): unknown;
      run(params?: unknown): unknown;
    };
    run(sql: string): unknown;
    close(): void;
  }
}
