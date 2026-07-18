"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

function DeviceApproveInner() {
  const params = useSearchParams();
  const { data: session, isPending } = useSession();
  const [code, setCode] = useState(params?.get("code") ?? "");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function approve(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage(null);
    try {
      await apiFetch("/v1/device/approve", {
        method: "POST",
        body: JSON.stringify({ userCode: code }),
      });
      setStatus("ok");
      setMessage("CLI linked. You can return to your terminal.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setLoading(false);
    }
  }

  if (isPending) {
    return <p className="text-mute">Checking session…</p>;
  }

  if (!session?.user) {
    return (
      <div className="animate-rise mx-auto max-w-md rounded-3xl border border-line bg-panel/60 p-6 sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-snow">Link your CLI</h1>
        <p className="mt-3 text-mute">
          Sign in first, then approve the code shown in your terminal.
        </p>
        <Button asChild className="mt-8">
          <Link
            href={`/login?next=/device${code ? `?code=${encodeURIComponent(code)}` : ""}`}
          >
            Log in to Continue
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-rise mx-auto max-w-md rounded-3xl border border-line bg-panel/60 p-6 sm:p-8">
      <h1 className="font-display text-3xl font-semibold text-snow">Approve device</h1>
      <p className="mt-3 text-sm text-mute">
        Enter the code from{" "}
        <code className="text-fog" translate="no">
          agent-eval-bench login
        </code>{" "}
        to connect your terminal as {session.user.email}.
      </p>
      <form onSubmit={approve} className="mt-8 space-y-3">
        <label className="block text-sm" htmlFor="user-code">
          <span className="text-mute">User code</span>
          <input
            id="user-code"
            name="userCode"
            autoComplete="off"
            spellCheck={false}
            className="focus-ring mt-1 w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 font-mono uppercase tracking-widest text-snow"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCD-EFGH…"
            required
          />
        </label>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Approving…" : "Approve"}
        </Button>
      </form>
      {message ? (
        <p
          className={`mt-4 text-sm ${status === "ok" ? "text-good" : "text-bad"}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export default function DevicePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-24 h-64 glow-horizon opacity-60" />
      <div className="container-page relative py-16 sm:py-20">
        <Suspense fallback={<p className="text-mute">Loading…</p>}>
          <DeviceApproveInner />
        </Suspense>
      </div>
    </div>
  );
}
