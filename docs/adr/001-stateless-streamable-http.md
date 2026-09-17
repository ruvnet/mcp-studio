# ADR 001: Stateless Streamable HTTP transport

Status: Accepted

## Context

ChatGPT needs a remotely reachable MCP endpoint. The starter should deploy to serverless Workers without durable session affinity.

## Decision

Expose `/api/mcp` using the SDK Web Standard Streamable HTTP transport with JSON responses and no server generated session ID. Create and close one MCP server and transport per request.

## Consequences

The deployment scales without sticky sessions. Long lived server state, resumable streams, and server initiated notifications require durable coordination outside this starter.

