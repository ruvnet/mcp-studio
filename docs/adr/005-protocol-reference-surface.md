# ADR 005: Protocol reference surface

## Status

Accepted

## Context

The original starter demonstrated five tools and one UI resource. That was sufficient for a first connection test but did not teach resource discovery, parameterized resources, completion, prompts, resource links, output schemas, or context budgeting.

MCP requires resources to have valid URIs but does not require a specific scheme. The specification explicitly permits custom RFC 3986 schemes. A custom namespace makes server mediated resources unambiguous without implying that a client can fetch them directly over HTTP.

## Decision

Use `mcp://studio/*` as the example namespace. Provide eight concrete resources, three resource templates, three prompts, and 12 read only tools. Resource templates expose bounded completion callbacks. Resources include MIME types and audience, priority, and modification annotations. Representative tools use output schemas and resource links.

The server remains stateless. Resource subscriptions and task augmented execution are intentionally not advertised because they require durable session or job state. The manifest reports these omissions explicitly.

## Consequences

The starter now covers the main stable MCP surfaces without introducing credentials, persistence, or writes. It remains safe to publish as a deterministic reference.

The `mcp://` namespace is portable only through MCP aware clients. It is not a protocol mandated scheme and must not be treated as a directly fetchable web URL.

Any future write tool requires execution time authorization, a human confirmation path, idempotency design, audit records, and new adversarial tests before release.
