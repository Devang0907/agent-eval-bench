import { DocsNav } from "@/components/DocsNav";
import { listDocs } from "@/lib/docs";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const docs = listDocs().map((d) => ({ slug: d.slug, title: d.title }));

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <p className="mb-3 text-xs uppercase tracking-wider text-mute">Documentation</p>
          <DocsNav docs={docs} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
