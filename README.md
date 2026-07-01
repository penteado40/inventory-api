# inventory-api

> Multi-tenant REST API for inventory management — track product movements across multiple store locations with scoped authentication and role-based access control.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=flat&logo=hono&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## Overview

inventory-api is a production-grade multi-tenant backend built to handle inventory operations across isolated store environments. Each store operates within its own data boundary — users, products, locations, and movement records are all scoped to a store at the middleware level, never trusting client-supplied identifiers.

The project explores two real architectural challenges: **multi-tenancy without schema-per-tenant** (using middleware-enforced scoping over a shared schema) and **stateless JWT auth with short-lived access tokens and server-side refresh token invalidation**.

**Key capabilities:**
- Store-scoped JWT auth with three roles (`admin`, `operator`, `viewer`)
- Product movement tracking with payment registration and cancellation with automatic item revert
- Hierarchical location types (e.g. warehouse → aisle → shelf)
- Auto-generated interactive API docs via OpenAPI + Scalar
- Soft deletes and referential integrity guards on all critical entities

---

## Architecture

### Request lifecycle

Every protected request passes through a deliberate middleware chain before reaching the controller:

```
HTTP Request
  └─ db middleware           Injects Prisma client into Hono context
  └─ cors middleware         Sets CORS headers
  └─ [public routes]         POST /auth/login, POST /auth/refresh
  └─ auth.middleware         Verifies JWT signature, injects jwtPayload
  └─ storeContext.middleware Resolves storeId from JWT or X-Store-Id header
  └─ validator               Validates request body/params with Zod
  └─ requireRole()           Guards route by role
  └─ controller              Calls service, returns { data }
  └─ service                 Business logic + Prisma access
  └─ model mapper            Shapes response, strips sensitive fields
  └─ onError (global)        Handles HTTPException | ZodError | Error
```

The critical design point: `storeId` is **never** read from the request body. It is always resolved by the `storeContext` middleware from the authenticated JWT payload. Admins can switch store context via the `X-Store-Id` header, which is validated against their permission scope.

### Project structure

```
src/
├── index.ts                        # App bootstrap, middleware registration, route mounting
├── types.ts                        # AppEnv, AppVariables, shared global types
├── controllers/                    # HTTP handlers — no business logic, no Prisma
├── services/                       # Business logic — no HTTP concerns
├── schemas/                        # Zod schemas for request validation
├── models/                         # TypeScript types + response mappers
├── middlewares/
│   ├── auth.middleware.ts           # JWT verification + payload injection
│   ├── store-context.middleware.ts  # Resolves and injects storeId into context
│   └── role.middleware.ts           # requireRole(...roles) factory
├── routes/
│   ├── index.ts                    # Barrel — aggregates all routes
│   └── *.routes.ts                 # Per-module route definitions
└── scripts/
    └── seed.ts                     # Seeds admin user and default store
```

---

## Key Technical Decisions

### Hono over Express
Hono provides first-class TypeScript support with typed context variables (`AppEnv`), built-in Zod validator middleware, and native OpenAPI integration. The `c.get('storeId')` pattern makes middleware-injected values fully typed throughout the request chain.

### Dual-token JWT strategy
Access tokens expire in 15 minutes to limit exposure. Refresh tokens (7-day TTL) are stored server-side, enabling revocation on logout — something pure stateless JWT cannot do. `POST /auth/switch-store` issues a new access token scoped to a different store without requiring re-login.

### Shared schema multi-tenancy
Each request resolves a `storeId` at the middleware level and propagates it via Hono context. All Prisma queries are implicitly scoped: services receive `storeId` as a parameter and never query across tenant boundaries. This avoids schema-per-tenant complexity while maintaining strict isolation.

### Prisma for query safety
Raw SQL was deliberately avoided. Prisma's typed query builder prevents SQL injection, generates TypeScript types from the schema, and makes migration history explicit and reviewable.

### Zod for boundary validation
All external input (body, params, query) is validated with Zod schemas before reaching controllers. The `@hono/zod-validator` middleware integrates Zod errors directly into Hono's error pipeline, returning consistent `{ errors }` responses.

---

## API Reference

Full interactive documentation is available at `/api/docs` (powered by Scalar). Below is a summary of available modules.

### Auth — `/api/auth`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/auth/login` | Authenticate with email and password | Public |
| `POST` | `/auth/refresh` | Exchange refresh token for new access token | Public |
| `POST` | `/auth/logout` | Invalidate refresh token server-side | ✅ |
| `POST` | `/auth/switch-store` | Issue new access token scoped to a different store | ✅ admin |

### Users — `/api/users`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/users` | List users (store-scoped) |
| `POST` | `/users` | Create user |
| `GET` | `/users/:id` | Get user by ID |
| `PUT` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Remove user |

### Stores — `/api/stores`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/stores` | List stores |
| `POST` | `/stores` | Create store |
| `GET` | `/stores/:id` | Get store by ID |
| `PUT` | `/stores/:id` | Update store (slug is immutable after creation) |
| `DELETE` | `/stores/:id` | Soft-delete store |

### Locations — `/api/location-types` · `/api/locations`

Hierarchical location system. Location types define the structure (e.g. Warehouse, Aisle, Shelf); locations are instances. Deletion is blocked if child locations or products are linked.

### Products — `/api/products`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/products` | List active products |
| `POST` | `/products` | Create product |
| `GET` | `/products/:id` | Get product by ID |
| `PUT` | `/products/:id` | Update product |
| `DELETE` | `/products/:id` | Remove product |

### Movements — `/api/movements`

The core of the inventory domain. Movements represent stock entries and exits, composed of items and optional payment records.

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/movements` | List movements |
| `POST` | `/movements` | Create movement header |
| `GET` | `/movements/:id` | Get movement with items and payments |
| `DELETE` | `/movements/:id` | Cancel movement — reverts non-finalized items |
| `POST` | `/movements/:id/items` | Add item to movement |
| `PUT` | `/movements/:id/items/:itemId` | Update movement item |
| `DELETE` | `/movements/:id/items/:itemId` | Remove or cancel item |
| `POST` | `/movements/:id/payments` | Register payment for movement |

### Stats — `/api/stats`

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/stats` | Stock summary and movement aggregates |

---

## Role Matrix

| Role | storeId in JWT | Scope |
|------|---------------|-------|
| `admin` | `null` | Global access — switches store context via `X-Store-Id` |
| `operator` | `number` | Restricted to own store, read/write |
| `viewer` | `number` | Restricted to own store, read-only |

---

## Response conventions

- **Success:** `{ "data": ... }`
- **Error:** `{ "errors": "..." }`
- URLs in English, plural nouns
- JSON keys in camelCase
- `storeId` never accepted from request body

---

## Local Setup

**Prerequisites:** Node.js 18+, Docker

```bash
# 1. Clone
git clone https://github.com/penteado40/inventory-api.git
cd inventory-api

# 2. Environment
cp .env.example .env
# Fill in the values — see table below

# 3. Start database
docker compose up -d

# 4. Install dependencies
npm install

# 5. Run migrations
npx prisma migrate dev

# 6. Seed default admin and store
npm run seed

# 7. Start dev server
npm run dev
```

API: `http://localhost:3000/api`
Docs: `http://localhost:3000/api/docs`

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing and verifying JWTs |
| `ADMIN_EMAIL` | ✅ | Default admin email (seed) |
| `ADMIN_PASSWORD` | ✅ | Default admin password (seed) |
| `ADMIN_NAME` | ✅ | Default admin name (seed) |
| `DEFAULT_STORE_NAME` | ⚪ | Default store name — defaults to `"Loja Principal"` |
| `DEFAULT_STORE_SLUG` | ⚪ | Default store slug — defaults to `"loja-principal"` |

---

## Implementation Status

| Phase | Modules | Status |
|-------|---------|--------|
| 1 | Auth, Stores, Seeds | ✅ Done |
| 2 | LocationTypes, Locations, MovementTypes | 🔄 In progress |
| 3 | Products | Planned |
| 4 | Movements, MovementItems, MovementPayments | Planned |
| 5 | Stats | Planned |

---

## Author

**Felipe Penteado** — Full Stack Engineer
[felipepenteado.com.br](https://felipepenteado.com.br) · [LinkedIn](https://linkedin.com/in/felipepenteado) · [GitHub](https://github.com/penteado40)
