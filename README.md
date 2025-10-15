# Wove — The Living Loom

A virtual small town for doing verified good.

## Quickstart
```bash
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:3000
pnpm db:seed
```

## What’s inside
- Next.js + Tailwind
- SQLite via better-sqlite3 (`wove.db` local file)
- API routes:
  - `/api/signals/top` — top-down signals
  - `/api/frictions` — bottom-up frictions
  - `/api/recipes` — IFUE-ranked guidance
- Components: Observatory, GuidanceEngine, Loom

## Env
Create `.env.local` if calling external LLMs (not required for the seed demo):
```
OPENAI_API_KEY=...
```

## Migrations
The initial schema is created automatically on first run in `lib/db.ts`.
For production, move to Postgres; keep the same table shapes.

## Concept
Top-down (news, research) + bottom-up (needs, proofs) meet in the middle (AI guidance) to produce ranked, verifiable Weave Plans.

## Terminology Map (UI → Code)
- **Patterns** → `signals_top` (API: `/api/signals/top`)
- **Weave Plans** → `recipes` (API: `/api/recipes`)
- **Needs** → `frictions` (API: `/api/frictions`)
- **Common Rooms** → coordination spaces (future table)
- **Threads (proofs)** → proof artifacts (future table `proofs`)
- **Good Index (GI)** → computed heartbeat across Planet/People/Democracy/Learning

## License
MIT
