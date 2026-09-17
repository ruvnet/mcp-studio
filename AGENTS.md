# MCP Studio Agent Contract

## Mission

Build a secure, comprehensible reference implementation for web based MCP tools and ChatGPT embedded interfaces. Prefer working examples and verifiable contracts over framework abstraction.

## Invariants

1. `/api/mcp` is the canonical remote endpoint.
2. Every public input is validated with a strict schema.
3. A tool result includes model readable `content` and UI readable `structuredContent`.
4. Tools are read only unless an ADR explicitly introduces a write boundary.
5. The embedded resource remains self contained unless its CSP metadata explicitly allows a dependency.
6. Browser and ChatGPT modes exercise the same server behavior.
7. Attribution remains visible for every externally inspired template.
8. No secrets, tokens, deployment identities, or runtime databases enter Git.

## Required validation

Run `pnpm check` before committing code. For MCP changes, confirm `tools/list`, valid and invalid tool calls, `resources/read`, CORS preflight, and production POST behavior.

## Ownership map

| Surface | Source |
| --- | --- |
| Tool metadata | `lib/catalog.ts` |
| Tool schemas and handlers | `lib/mcp-server.ts` |
| HTTP transport | `app/mcp/route.ts` |
| Browser workbench | `app/page.tsx` |
| Template catalog | `lib/templates.ts` |
| Embedded UI | `widget/template.html`, `widget/main.ts` |
| Protocol acceptance tests | `scripts/test-mcp.mjs` |

## Change discipline

1. Read the relevant ADR and source before editing.
2. Keep one authoritative definition for shared metadata.
3. Avoid client only mocks when the feature claims to call MCP.
4. Treat response bodies as untrusted until status and content type are checked.
5. Preserve accessibility, mobile behavior, and both color modes.
6. Add an ADR when changing transport, trust boundaries, resource topology, authentication, persistence, or public compatibility.

## RuFlo workflow

Use RuFlo for work spanning three or more modules, security boundaries, protocol changes, or performance investigations.

```bash
npx ruflo@latest memory search --query "mcp studio patterns" --namespace patterns
npx ruflo@latest hooks route --task "describe the task"
npx ruflo@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

Recommended roles:

| Change | Roles |
| --- | --- |
| Protocol feature | architect, coder, tester, reviewer |
| Security change | security architect, coder, auditor |
| UI resource | designer, coder, accessibility reviewer |
| Performance | performance engineer, coder, tester |

Store durable learning only after tests pass. Never let generated swarm state replace source control provenance.

## Pull request acceptance

1. The production build succeeds.
2. Protocol tests pass.
3. New behavior has a manual acceptance path.
4. Security implications are documented.
5. Generated widget output matches widget source.
6. No unrelated generated or runtime files are committed.

