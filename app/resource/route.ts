import { RESOURCE_URI } from '@/lib/catalog';
export function GET(){return Response.json({uri:RESOURCE_URI,mimeType:'text/html;profile=mcp-app',mcpEndpoint:'/api/mcp',browserPreview:'/widget?mode=web',readRequest:{jsonrpc:'2.0',id:1,method:'resources/read',params:{uri:RESOURCE_URI}}})}
