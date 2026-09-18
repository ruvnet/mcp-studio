const DEFAULT_ISSUER = 'https://auth.cognitum.one';
const DEFAULT_SCOPES = ['mcp:read', 'mcp:invoke'];
const JWKS_TTL_MS = 10 * 60 * 1000;
const CLOCK_LEEWAY_SECONDS = 5;

type JwtHeader = { alg?: unknown; kid?: unknown };
type JwtClaims = {
  iss?: unknown;
  aud?: unknown;
  exp?: unknown;
  nbf?: unknown;
  typ?: unknown;
  sub?: unknown;
  org_id?: unknown;
  workspace_id?: unknown;
  scope?: unknown;
  setup?: unknown;
  workload?: unknown;
};
type Jwk = JsonWebKey & { kid?: string; kty?: string; crv?: string };

export type CognitumPrincipal = {
  subject: string;
  tenantId: string;
  workspaceId?: string;
  scopes: string[];
};

let jwksCache: { expiresAt: number; keys: Map<string, Jwk> } | undefined;

function issuer() {
  return process.env.COGNITUM_OAUTH_ISSUER || DEFAULT_ISSUER;
}

function acceptedScopes() {
  const configured = process.env.COGNITUM_MCP_SCOPES?.trim().split(/\s+/).filter(Boolean);
  return configured?.length ? configured : DEFAULT_SCOPES;
}

function base64urlBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64urlBytes(value))) as T;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function loadJwks(force = false) {
  if (!force && jwksCache && jwksCache.expiresAt > Date.now()) return jwksCache.keys;
  const response = await fetch(`${issuer()}/.well-known/jwks.json`, {
    headers: { Accept: 'application/json' },
    cf: { cacheTtl: 600, cacheEverything: true },
  } as RequestInit);
  if (!response.ok) throw new Error('Cognitum JWKS is unavailable');
  const document = await response.json() as { keys?: Jwk[] };
  const keys = new Map<string, Jwk>();
  for (const key of document.keys ?? []) {
    if (key.kid && key.kty === 'EC' && key.crv === 'P-256' && key.x && key.y) keys.set(key.kid, key);
  }
  if (!keys.size) throw new Error('Cognitum JWKS has no usable ES256 keys');
  jwksCache = { expiresAt: Date.now() + JWKS_TTL_MS, keys };
  return keys;
}

async function verificationKey(kid: string) {
  let jwk = (await loadJwks()).get(kid);
  if (!jwk) jwk = (await loadJwks(true)).get(kid);
  if (!jwk) throw new Error('Unknown Cognitum signing key');
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
}

export async function validateCognitumToken(token: string): Promise<CognitumPrincipal> {
  if (!token || token.length > 16_384) throw new Error('Invalid bearer token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid bearer token');
  const [encodedHeader, encodedClaims, encodedSignature] = parts;
  const header = decodeJson<JwtHeader>(encodedHeader);
  if (header.alg !== 'ES256' || typeof header.kid !== 'string' || !header.kid) throw new Error('Invalid bearer token');
  const key = await verificationKey(header.kid);
  const verified = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    base64urlBytes(encodedSignature).buffer as ArrayBuffer,
    new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`),
  );
  if (!verified) throw new Error('Invalid bearer token');

  const claims = decodeJson<JwtClaims>(encodedClaims);
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== issuer()) throw new Error('Invalid token issuer');
  if (typeof claims.exp !== 'number' || claims.exp + CLOCK_LEEWAY_SECONDS < now) throw new Error('Expired bearer token');
  if (typeof claims.nbf === 'number' && claims.nbf - CLOCK_LEEWAY_SECONDS > now) throw new Error('Bearer token is not active');
  const audiences = typeof claims.aud === 'string' ? [claims.aud] : Array.isArray(claims.aud) ? claims.aud : [];
  if (!audiences.some(value => typeof value === 'string' && value.length > 0)) throw new Error('Missing token audience');
  if (claims.typ !== 'access' || claims.setup === true || claims.workload === true) throw new Error('Invalid token class');
  if (typeof claims.sub !== 'string' || !claims.sub) throw new Error('Missing token subject');
  if (typeof claims.org_id !== 'string' || !isUuid(claims.org_id)) throw new Error('Missing Cognitum tenant');

  const scopes = typeof claims.scope === 'string' ? claims.scope.split(/\s+/).filter(Boolean) : [];
  if (!scopes.some(scope => acceptedScopes().includes(scope))) {
    const error = new Error('Cognitum token lacks an MCP scope');
    error.name = 'InsufficientScopeError';
    throw error;
  }
  return {
    subject: claims.sub,
    tenantId: claims.org_id,
    workspaceId: typeof claims.workspace_id === 'string' ? claims.workspace_id : undefined,
    scopes,
  };
}

function metadataUrl(request: Request) {
  const url = new URL(request.url);
  const resourcePath = url.pathname === '/api/mcp' ? '/api/mcp' : '/mcp';
  return new URL(`/.well-known/oauth-protected-resource${resourcePath}`, url.origin).toString();
}

function challenge(request: Request, error?: string) {
  const details = [`resource_metadata="${metadataUrl(request)}"`, `scope="${acceptedScopes().join(' ')}"`];
  if (error) details.push(`error="${error}"`);
  return `Bearer ${details.join(', ')}`;
}

export async function authorizeMcpRequest(request: Request): Promise<CognitumPrincipal | Response> {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) return new Response('Cognitum authentication required', { status: 401, headers: { 'WWW-Authenticate': challenge(request), 'Cache-Control': 'no-store' } });
  try {
    return await validateCognitumToken(match[1]);
  } catch (error) {
    const insufficientScope = error instanceof Error && error.name === 'InsufficientScopeError';
    return new Response(insufficientScope ? 'Cognitum MCP scope required' : 'Invalid Cognitum access token', {
      status: insufficientScope ? 403 : 401,
      headers: {
        'WWW-Authenticate': challenge(request, insufficientScope ? 'insufficient_scope' : 'invalid_token'),
        'Cache-Control': 'no-store',
      },
    });
  }
}

export function protectedResourceMetadata(request: Request, resourcePath = '/mcp') {
  const origin = new URL(request.url).origin;
  return Response.json({
    resource: new URL(resourcePath, origin).toString(),
    authorization_servers: [issuer()],
    scopes_supported: acceptedScopes(),
    bearer_methods_supported: ['header'],
    resource_documentation: new URL('/resource', origin).toString(),
  }, { headers: { 'Cache-Control': 'public, max-age=300', 'Access-Control-Allow-Origin': '*' } });
}
