"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

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
    try {
      const data = await apiFetch<{ accessToken: string }>("/v1/me/tokens", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setCreated(data.accessToken);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    }
  }

  async function revoke(id: string) {
    await apiFetch(`/v1/me/tokens/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="animate-rise space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-snow">Settings</h1>
        <p className="mt-2 text-sm text-mute">Account and API access for the CLI bridge.</p>
      </div>

      <section className="border-t border-line pt-6">
        <h2 className="font-display text-lg font-medium text-snow">Profile</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-20 text-mute">Name</dt>
            <dd className="text-fog">{session?.user?.name}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 text-mute">Email</dt>
            <dd className="text-fog">{session?.user?.email}</dd>
          </div>
        </dl>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="font-display text-lg font-medium text-snow">Link CLI</h2>
        <p className="mt-2 text-sm text-mute">
          Prefer device login from the terminal. Or create a personal token manually.
        </p>
        <Link href="/device" className="mt-4 inline-block text-sm text-accent-soft hover:text-snow">
          Open device approval →
        </Link>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="font-display text-lg font-medium text-snow">API tokens</h2>
        <form onSubmit={createToken} className="mt-4 flex flex-wrap gap-2">
          <input
            className="focus-ring rounded-xl border border-line bg-ink-soft px-3 py-2 text-sm text-snow"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            className="focus-ring rounded-full bg-snow px-4 py-2 text-sm font-medium text-ink"
          >
            Create token
          </button>
        </form>
        {created && (
          <p className="mt-3 break-all rounded-xl border border-line bg-ink-soft p-3 font-mono text-xs text-good">
            {created}
          </p>
        )}
        {error && <p className="mt-3 text-sm text-bad">{error}</p>}
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {tokens.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="text-snow">{t.name}</p>
                <p className="font-mono text-mute">{t.tokenPrefix}…</p>
              </div>
              <button
                type="button"
                onClick={() => revoke(t.id)}
                className="text-bad hover:text-snow"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
