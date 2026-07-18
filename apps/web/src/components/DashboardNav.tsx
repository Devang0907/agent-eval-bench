"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/runs", label: "Runs" },
  { href: "/dashboard/leaderboard", label: "Leaderboard" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/device", label: "Link CLI" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-full shrink-0 border-b border-line pb-4 md:w-52 md:border-b-0 md:border-r md:pb-0 md:pr-6">
      <p className="text-xs uppercase tracking-wider text-mute">Dashboard</p>
      <p className="mt-1 truncate text-sm text-fog">{session?.user?.email ?? "…"}</p>
      <nav className="mt-6 flex flex-wrap gap-2 md:flex-col md:gap-1">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-panel text-snow" : "text-mute hover:text-snow"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() =>
          signOut({
            fetchOptions: {
              onSuccess: () => {
                window.location.href = "/";
              },
            },
          })
        }
        className="mt-6 text-sm text-mute hover:text-snow"
      >
        Sign out
      </button>
    </aside>
  );
}
