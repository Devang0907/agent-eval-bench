import { defineValidator, ok, fail } from "./util.js";

export const fileExists = defineValidator(
  "file-exists",
  "Check that a file exists in the sandbox",
  async (ctx, params) => {
    const path = String(params?.["path"] ?? "");
    if (!path) return fail("file-exists", "Missing path param");
    const exists = await ctx.exists(path);
    return exists
      ? ok("file-exists", `File exists: ${path}`)
      : fail("file-exists", `File missing: ${path}`);
  },
);

export const fileContains = defineValidator(
  "file-contains",
  "Check that a file contains a substring or regex",
  async (ctx, params) => {
    const path = String(params?.["path"] ?? "");
    const contains = params?.["contains"] != null ? String(params["contains"]) : undefined;
    const matches = params?.["matches"] != null ? String(params["matches"]) : undefined;
    if (!path) return fail("file-contains", "Missing path param");
    const content = await ctx.readFile(path);
    if (content === null) return fail("file-contains", `File missing: ${path}`);
    if (contains && !content.includes(contains)) {
      return fail("file-contains", `File ${path} does not contain "${contains}"`);
    }
    if (matches) {
      const re = new RegExp(matches);
      if (!re.test(content)) {
        return fail("file-contains", `File ${path} does not match /${matches}/`);
      }
    }
    return ok("file-contains", `File ${path} content matches expectations`);
  },
);

export const fileAbsent = defineValidator(
  "file-absent",
  "Check that a file does not exist",
  async (ctx, params) => {
    const path = String(params?.["path"] ?? "");
    const exists = await ctx.exists(path);
    return exists
      ? fail("file-absent", `File should not exist: ${path}`)
      : ok("file-absent", `File correctly absent: ${path}`);
  },
);
