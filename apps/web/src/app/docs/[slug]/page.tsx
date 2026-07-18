import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getDoc, listDocs } from "@/lib/docs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return listDocs()
    .filter((d) => d.slug !== "index")
    .map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  return { title: doc?.meta.title ?? "Docs" };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  return (
    <article className="animate-rise prose-docs">
      <h1>{doc.meta.title}</h1>
      {doc.meta.description ? <p className="text-mute">{doc.meta.description}</p> : null}
      <MDXRemote source={doc.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
    </article>
  );
}
