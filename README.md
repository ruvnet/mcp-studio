# MCP Studio

A generic web based ChatGPT plugin starter. The site and the embedded widget share one real MCP server. The browser playground uses deterministic example tools; it does not call an LLM or impersonate ChatGPT.

## Routes

* `/`: playground, tool schemas, resource and prompt inspectors, connection guide.
* `/mcp` and `/api/mcp`: Cognitum protected stateless Streamable HTTP MCP, POST JSON-RPC. GET returns 405 after authentication because this server does not offer a standalone SSE stream.
* `/widget?mode=web`: standalone browser widget.
* `/resource`: resource metadata and resources/read example.
* MCP resource `ui://starter/dashboard.html`: complete bundled HTML with the standard MCP Apps bridge.
* `mcp://studio/*`: custom RFC 3986 resource namespace for catalogs, examples, schemas, and security guidance.

## Run

Use Node 22.13 or later and the pnpm version declared in package.json.

```
pnpm install
node scripts/build-widget.mjs
pnpm dev
pnpm build
```

The server exposes 12 read only tools. Two render MCP Apps. Ten return structured data for catalog search, schema validation, context budgeting, workflow planning, resource discovery, security review, estimates, examples, and templates. They are deterministic, validated with Zod, and need no API key. Calculator inputs are assumptions, not provider pricing or benchmark measurements.

The resource surface includes eight concrete resources and three URI templates. `mcp://` is a deliberate custom scheme, not an MCP requirement. Clients can list resources, list templates, complete template variables, read resolved resources, and consume resource links returned by tools. Three prompts cover tool design, server audit, and MCP App planning. See [ADR 005](docs/adr/005-protocol-reference-surface.md).

The Templates tab includes five responsive admin dashboard patterns for analytics, commerce, logistics, healthcare, and fintech. Every pattern supports light and dark presentation and includes a direct attribution link to the Dribbble design used as a visual reference. Template metadata lives in `lib/templates.ts` so the website, MCP tools, and embedded UI use one catalog.

The gallery uses five distinct information architectures rather than one reskinned dashboard. Each surface has an independent navigation model, content hierarchy, visualization language, responsive reduction strategy, and light or dark treatment. See [ADR 004](docs/adr/004-distinct-template-systems.md).

The widget uses `@modelcontextprotocol/ext-apps` for initialization, tool result notifications, tool calls, and user initiated followup messages. Server transport uses the official MCP TypeScript SDK. The resource allows no external network or script domains. Host context controls its light or dark theme. The browser preview deliberately selects web mode and calls the same server directly.

## Connect

A remote MCP client connects to `/mcp` and authenticates through `https://auth.cognitum.one`. The resource server publishes RFC 9728 metadata, accepts ES256 access tokens from Cognitum, requires `mcp:read` or `mcp:invoke`, and derives the tenant only from the signed `org_id` claim. This follows the ruOS connector model: Cognitum currently mints a dynamic connector client ID as `aud`, so MCP authorization is scope bound until the authorization server supports RFC 8707 resource audiences. In ChatGPT developer settings, register the reachable endpoint and ask to show the starter dashboard. Workspace availability varies.

## Customize

Edit `lib/catalog.ts` for tools, resources, templates, and prompts; `lib/mcp-server.ts` for validated handlers; and `widget/main.ts` plus `widget/template.html` for the embedded UI. Run `node scripts/build-widget.mjs` after widget changes. The main build regenerates it automatically.

No persistent user state, external actions, API keys, or paid inference are included. Add per user authorization, durable storage, distributed rate limits, and audit trails before expanding beyond harmless examples. Readonly annotations inform the host; they are not authorization. HTTP bodies are capped at 32 KiB and browser origins are checked. SDK validation rejects malformed messages and unknown tools.

The download deliberately excludes site identity, credentials, runtime data, node_modules, and build output. Register a new Site when reusing it; never copy another project's hosting identity.

## Verify

```
node scripts/test-mcp.mjs
```

The suite covers 30 protocol and security assertions across 12 tools, eight resources, three resource templates, completion, prompts, UI resources, malformed input, payload limits, and CORS. Then open the playground, run each tool, inspect Resources and Prompts, and change calculator inputs. Final ChatGPT acceptance: connect a reachable endpoint, read `mcp://studio/manifest`, then calculate 2000 requests at $0.002 and 250 ms. Expect $4.00 and 500.0 seconds.

Official references:
https://developers.openai.com/plugins/build/chatgpt-ui
https://developers.openai.com/plugins/build/api/mcp-server
https://modelcontextprotocol.io/extensions/apps/overview
https://modelcontextprotocol.io/specification/2025-11-25/server/resources
https://modelcontextprotocol.io/specification/2025-11-25/server/tools
