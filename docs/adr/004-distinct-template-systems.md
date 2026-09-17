# ADR 004: Templates use distinct product systems

Status: Accepted

## Context

The initial gallery reused one dashboard shell across five industries. Color and labels changed, but navigation, hierarchy, density, and chart language remained nearly identical. This made the gallery useful as a technical example but weak as a design reference.

## Decision

Each template now owns a distinct product model:

1. Signal Analytics uses an executive scorecard and regional performance model.
2. Order Command uses an editorial commerce layout with products and fulfillment.
3. Fleet Pulse is map first and optimized around live dispatch state.
4. Care Calendar is schedule first and optimized for clinical capacity.
5. Ledger Flow uses a treasury model with balances, limits, cash flow, and transactions.

Light and dark modes remain available at the gallery level. Responsive rules preserve the primary task by removing secondary panels before shrinking core data beyond usability.

Dribbble references remain attribution and inspiration only. The implementation uses original code, data, layouts, and visual assets.

## Consequences

The gallery has more component and CSS surface area, but it better demonstrates how MCP structured content can drive genuinely different embedded applications. Future templates must introduce a new information architecture, not merely a new palette.
