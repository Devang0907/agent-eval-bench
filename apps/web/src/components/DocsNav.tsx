"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DocsNav({
  docs,
}: {
  docs: Array<{ slug: string; title: string }>;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {docs.map((doc) => {
        const href = doc.slug === "index" ? "/docs" : `/docs/${doc.slug}`;
        const active = pathname === href || (doc.slug === "index" && pathname === "/docs");
        return (
          <Link
            key={doc.slug}
            href={href}
            className={`block rounded-lg px-3 py-2 text-sm transition ${
              active ? "bg-panel text-snow" : "text-mute hover:text-snow"
            }`}
          >
            {doc.title}
          </Link>
        );
      })}
    </nav>
  );
}
