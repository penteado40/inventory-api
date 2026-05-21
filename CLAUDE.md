# inventory-api

Multi-tenant REST API for inventory management. Hono + TypeScript + Zod + Prisma + PostgreSQL.

## Quick navigation

- **Domain context & data models:** `.claude/CONTEXT.md`
- **Implementation rules by layer:**
  - Schemas: `.claude/rules/RULES-schemas.md`
  - Models/mappers: `.claude/rules/RULES-models.md`
  - Services: `.claude/rules/RULES-services.md`
  - Controllers: `.claude/rules/RULES-controllers.md`
  - Middlewares: `.claude/rules/RULES-middlewares.md`
  - Routes: `.claude/rules/RULES-routes.md`
  - MCP Server: `.claude/rules/RULES-mcp.md`

## Stack

| | |
|---|---|
| Runtime | Bun |
| Framework | Hono |
| Validation | Zod + hono-openapi |
| ORM | Prisma |
| DB | PostgreSQL (Docker) |
| Auth | JWT HS256 — 15 min access + 7 day refresh |

## Dev workflow

```sh
docker compose up -d      # start Postgres
bun run dev               # start API on :3000
bunx prisma migrate dev   # run migrations
bun run seed              # seed admin + default store
```

## Agent skills

### Issue tracker

Issues live in GitHub Issues on github.com/penteado40/inventory-api. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — `CONTEXT.md` at `.claude/CONTEXT.md`, rules at `.claude/rules/`. See `docs/agents/domain.md`.
