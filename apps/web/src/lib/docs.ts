import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

export type DocMeta = {
  slug: string;
  title: string;
  description?: string;
  order: number;
};

export function listDocs(): DocMeta[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf8");
      const { data } = matter(raw);
      const slug = file.replace(/\.mdx?$/, "");
      return {
        slug,
        title: String(data.title ?? slug),
        description: data.description ? String(data.description) : undefined,
        order: typeof data.order === "number" ? data.order : 99,
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getDoc(slug: string): { meta: DocMeta; content: string } | null {
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const file of candidates) {
    const full = path.join(DOCS_DIR, file);
    if (!fs.existsSync(full)) continue;
    const raw = fs.readFileSync(full, "utf8");
    const { data, content } = matter(raw);
    return {
      meta: {
        slug,
        title: String(data.title ?? slug),
        description: data.description ? String(data.description) : undefined,
        order: typeof data.order === "number" ? data.order : 99,
      },
      content,
    };
  }
  return null;
}
