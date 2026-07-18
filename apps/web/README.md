# `@agent-eval-bench/web`

Next.js marketing site, MDX docs, and authenticated dashboard.

**Private package** — not published to npm. Users who install `agent-eval-bench` do not download this app.

```bash
# from repo root (API must be running on :4000)
bun run dev:web
```

Open [http://localhost:3000](http://localhost:3000). Auth and `/v1/*` are proxied to the Bun API via Next.js rewrites.
