import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from '@/lib/mcp-server';
const corsHeaders={
 'Access-Control-Allow-Origin':'*',
 'Access-Control-Allow-Methods':'POST, OPTIONS',
 'Access-Control-Allow-Headers':'Content-Type, Accept, Authorization, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID',
 'Access-Control-Expose-Headers':'MCP-Session-Id',
 'Access-Control-Max-Age':'86400',
 'Vary':'Origin, Access-Control-Request-Headers',
};
const withCors=(response:Response)=>{const headers=new Headers(response.headers);for(const [name,value] of Object.entries(corsHeaders))headers.set(name,value);return new Response(response.body,{status:response.status,statusText:response.statusText,headers})};
export async function POST(request:Request){
 if(!request.headers.get('content-type')?.includes('application/json'))return withCors(new Response('Expected application/json',{status:415}));
 // Bound decoded bytes before parsing; no credentials or arbitrary outbound fetches.
 const reader=request.body?.getReader();if(!reader)return withCors(new Response('Missing request body',{status:400}));
 let size=0;const chunks:Uint8Array[]=[];
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>32768){await reader.cancel();return withCors(new Response('Request too large',{status:413}))}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 const transport=new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});const server=createServer();
 try{await server.connect(transport);const response=await transport.handleRequest(new Request(request.url,{method:'POST',headers:request.headers,body:bytes}));const body=await response.arrayBuffer();const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');return withCors(new Response(body,{status:response.status,headers}));}finally{await server.close()}
}
export function OPTIONS(){return new Response(null,{status:204,headers:corsHeaders})}
export function GET(){return withCors(new Response('This stateless MCP endpoint accepts JSON-RPC POST requests. Open / for the playground or /resource for metadata.',{status:405,headers:{Allow:'POST, OPTIONS','Content-Type':'text/plain'}}))}
export const DELETE=GET;
