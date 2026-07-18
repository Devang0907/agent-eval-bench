"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type TokenRow = {
  id: string;
  name: string;
  tokenPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [name, setName] = useState("Personal token");
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const data = await apiFetch<{ tokens: TokenRow[] }>("/v1/me/tokens");
      setTokens(data.tokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tokens");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createToken(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);
    setCreating(true);
    try {
      const data = await apiFetch<{ accessToken: string }>("/v1/me/tokens", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setCreated(data.accessToken);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    if (!window.confirm("Revoke this API token? The CLI will stop authenticating with it.")) {
      return;
    }
    await apiFetch(`/v1/me/tokens/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="animate-rise space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-snow">Settings</h1>
        <p className="mt-2 text-sm text-mute">Account and API access for the CLI bridge.</p>
      </div>

      <section className="rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="font-display text-lg font-medium text-snow">Profile</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-20 text-mute">Name</dt>
            <dd className="min-w-0 truncate text-fog">{session?.user?.name}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 text-mute">Email</dt>
            <dd className="min-w-0 truncate text-fog">{session?.user?.email}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="font-display text-lg font-medium text-snow">Link CLI</h2>
        <p className="mt-2 text-sm text-mute">
          Prefer device login from the terminal. Or create a personal token manually.
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-4">
          <Link href="/device">Open device approval</Link>
        </Button>
      </section>

      <section className="rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="font-display text-lg font-medium text-snow">API tokens</h2>
        <form onSubmit={createToken} className="mt-4 flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="token-name">
            Token name
          </label>
          <input
            id="token-name"
            name="tokenName"
            autoComplete="off"
            spellCheck={false}
            className="focus-ring rounded-xl border border-line bg-ink-soft px-3 py-2 text-sm text-snow"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create Token"}
          </Button>
        </form>
        {created ? (
          <p
            className="mt-3 break-all rounded-xl border border-line bg-ink-soft p-3 font-mono text-xs text-good"
            aria-live="polite"
          >
            {created}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm text-bad" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {tokens.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate text-snow">{t.name}</p>
                <p className="font-mono text-mute">
                  {t.tokenPrefix}…
                </p>
              </div>
              <Button type="button" variant="destructive" size="sm" onClick={() => revoke(t.id)}>
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
