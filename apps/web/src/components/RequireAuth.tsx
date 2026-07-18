"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-mute">Loading session…</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="animate-rise max-w-md rounded-3xl border border-line bg-panel/60 p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-snow">Sign in required</h1>
          <p className="mt-2 text-sm text-mute">
            Your dashboard shows synced eval runs, telemetry logs, and leaderboards.
          </p>
          <Button asChild className="mt-6">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
