"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <p className="text-mute">Loading session…</p>;
  }

  if (!session?.user) {
    return (
      <div className="animate-rise max-w-md">
        <h1 className="font-display text-2xl font-semibold text-snow">Sign in required</h1>
        <p className="mt-2 text-sm text-mute">
          Your dashboard shows synced eval runs, telemetry logs, and leaderboards.
        </p>
        <Link
          href="/login"
          className="focus-ring mt-6 inline-flex rounded-full bg-snow px-5 py-2.5 text-sm font-medium text-ink"
        >
          Log in
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
