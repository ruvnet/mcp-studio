# ADR 002: One resource, two runtimes

Status: Accepted

## Context

Developers need browser inspection while ChatGPT needs the same interface as an MCP Apps resource.

## Decision

Author one widget bundle. Browser mode calls `/api/mcp`. ChatGPT mode connects through the MCP Apps host bridge. Host context controls theme and sizing.

## Consequences

Browser and conversational UI share behavior. A feature is incomplete if it works in only one mode without an explicit rationale.

