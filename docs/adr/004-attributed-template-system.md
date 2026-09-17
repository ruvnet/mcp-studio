# ADR 004: Attributed template system

Status: Accepted

## Context

Developers benefit from polished embedded UI patterns, but references must not become uncredited copies or introduce external assets.

## Decision

Maintain one typed catalog in `lib/templates.ts`. Every record includes a stable ID, category, creator, source title, direct Dribbble URL, accent, and description. Implement original responsive components without copying logos or proprietary assets. Support light and dark presentation.

## Consequences

Attribution remains machine readable and visible. Templates can be returned as structured MCP data and rendered by the website or embedded widget.

