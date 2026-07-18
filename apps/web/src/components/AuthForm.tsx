"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/auth-client";
import { APP_URL } from "@/lib/config";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await signUp.email({ name, email, password });
        if (res.error) throw new Error(res.error.message ?? "Sign up failed");
      } else {
        const res = await signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message ?? "Login failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    await signIn.social({
      provider: "google",
      callbackURL: `${APP_URL}/dashboard`,
    });
  }

  return (
    <div className="mx-auto w-full max-w-md animate-rise">
      <div className="rounded-3xl border border-line bg-panel/60 p-6 shadow-2xl shadow-black/40 sm:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-snow">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-mute">
          {mode === "login"
            ? "Sign in to view synced runs, logs, and leaderboards."
            : "Start syncing local agent evals to your dashboard."}
        </p>

        <Button type="button" variant="secondary" className="mt-8 w-full" onClick={onGoogle}>
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-mute">
          <div className="h-px flex-1 bg-line" aria-hidden="true" />
          or
          <div className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" ? (
            <label className="block text-sm" htmlFor="auth-name">
              <span className="text-mute">Name</span>
              <input
                id="auth-name"
                name="name"
                className="focus-ring mt-1 w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-snow"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
          ) : null}
          <label className="block text-sm" htmlFor="auth-email">
            <span className="text-mute">Email</span>
            <input
              id="auth-email"
              name="email"
              type="email"
              inputMode="email"
              spellCheck={false}
              className="focus-ring mt-1 w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-snow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="block text-sm" htmlFor="auth-password">
            <span className="text-mute">Password</span>
            <input
              id="auth-password"
              name="password"
              type="password"
              className="focus-ring mt-1 w-full rounded-xl border border-line bg-ink-soft px-3 py-2.5 text-snow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          {error ? (
            <p className="text-sm text-bad" role="alert" aria-live="polite">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-mute">
          {mode === "login" ? (
            <>
              No account?{" "}
              <Link href="/signup" className="text-accent-soft hover:text-snow">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-accent-soft hover:text-snow">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
