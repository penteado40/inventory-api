# Domain Docs

How the engineering skills should consume this repo's domain documentation.

## Before exploring, read these

- **`.claude/CONTEXT.md`** — domain overview, data models, module map, global constraints
- **`.claude/rules/RULES-<layer>.md`** — implementation rules by layer (schemas, models, services, controllers, middlewares, routes, mcp)
- **`docs/adr/`** — architectural decisions (create this directory when the first ADR is needed)

If any of these files don't exist, proceed silently.

## File structure

Single-context repo:

```
/
├── .claude/
│   ├── CONTEXT.md          ← domain context + data models
│   └── rules/
│       ├── RULES-schemas.md
│       ├── RULES-models.md
│       ├── RULES-services.md
│       ├── RULES-controllers.md
│       ├── RULES-middlewares.md
│       ├── RULES-routes.md
│       └── RULES-mcp.md
├── docs/adr/               ← create when first ADR is needed
└── src/
```

## Use the glossary's vocabulary

When naming a domain concept in an issue, refactor proposal, hypothesis, or test, use the term as defined in `.claude/CONTEXT.md`. Don't drift to synonyms.

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly rather than silently overriding.
