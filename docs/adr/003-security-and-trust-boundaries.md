# ADR 003: Security and trust boundaries

Status: Accepted

## Context

A public MCP endpoint receives untrusted network input. Its output is consumed by a model and embedded browser context.

## Decision

Keep the demo read only and deterministic. Enforce strict schemas, a 32 KiB request limit, explicit CORS, no store responses, MIME sniffing protection, and a resource CSP with no external domains. Check status and content type before client JSON parsing.

No authentication is acceptable only while the service contains harmless examples and no private data.

## Consequences

Any private data, tenancy, external service, or write action requires OAuth, authorization, rate limiting, audit records, and a new ADR.

