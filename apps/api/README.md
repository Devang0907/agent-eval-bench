# `@agent-eval-bench/api`

Bun HTTP API for auth, device-code CLI login, and synced eval runs.

**Private package** — not published to npm. Users who install `agent-eval-bench` do not download this app.

```bash
# from repo root
docker compose up -d
cp .env.example .env
bun run db:push
bun run dev
```

Health: `GET http://localhost:4000/health`
