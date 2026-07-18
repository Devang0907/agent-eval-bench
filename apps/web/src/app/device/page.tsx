"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

function DeviceApproveInner() {
  const params = useSearchParams();
  const { data: session, isPending } = useSession();
  const [code, setCode] = useState(params.get("code") ?? "");
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
      <div className="animate-rise">
        <h1 className="font-display text-3xl font-semibold text-snow">Link your CLI</h1>
        <p className="mt-3 text-mute">Sign in first, then approve the code shown in your terminal.</p>
        <Link
          href={`/login?next=/device${code ? `?code=${encodeURIComponent(code)}` : ""}`}
          className="focus-ring mt-8 inline-flex rounded-full bg-snow px-5 py-2.5 text-sm font-medium text-ink"
        >
          Log in to continue
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-rise max-w-md">
      <h1 className="font-display text-3xl font-semibold text-snow">Approve device</h1>
      <p className="mt-3 text-sm text-mute">
        Enter the code from <code className="text-fog">agent-eval-bench login</code> to connect your
        terminal as {session.user.email}.
      </p>
      <form onSubmit={approve} className="mt-8 space-y-3">
        <label className="block text-sm">
          <span className="text-mute">User code</span>
          <input
            className="focus-ring mt-1 w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 font-mono uppercase tracking-widest text-snow"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABCD-EFGH"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="focus-ring w-full rounded-full bg-snow px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
        >
          {loading ? "Approving…" : "Approve"}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm ${status === "ok" ? "text-good" : "text-bad"}`}>{message}</p>
      )}
    </div>
  );
}

export default function DevicePage() {
  return (
    <div className="container-page py-16">
      <Suspense fallback={<p className="text-mute">Loading…</p>}>
        <DeviceApproveInner />
      </Suspense>
    </div>
  );
}
