import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getDoc } from "@/lib/docs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Docs" };

export default async function DocsIndexPage() {
  const doc = getDoc("index");
  if (!doc) {
    return <p className="text-mute">Docs not found.</p>;
  }

  return (
    <article className="animate-rise prose-docs">
      <h1>{doc.meta.title}</h1>
      {doc.meta.description ? <p className="text-mute">{doc.meta.description}</p> : null}
      <MDXRemote source={doc.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </article>
  );
}
