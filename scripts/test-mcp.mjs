import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);const esbuild=await import(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
const dir=await mkdtemp(tmpdir()+'/mcp-test-');
try{
await esbuild.build({entryPoints:['app/mcp/route.ts'],bundle:true,platform:'node',format:'esm',outfile:dir+'/route.mjs',packages:'bundle'});
const {POST,GET,OPTIONS}=await import(pathToFileURL(dir+'/route.mjs'));
let checks=0;
async function rpc(method,params={}){const res=await POST(new Request('https://example.test/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})}));assert.equal(res.status,200);return res.json()}
const init=await rpc('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'acceptance',version:'1'}});assert.equal(init.result.serverInfo.name,'mcp-studio');checks++;
const list=await rpc('tools/list');assert.equal(list.result.tools.length,5);assert.equal(list.result.tools.filter(t=>t._meta?.ui?.resourceUri).length,2);checks++;
const dash=await rpc('tools/call',{name:'show_dashboard',arguments:{}});assert.equal(dash.result.structuredContent.estimate.totalCost,2);checks++;
const calc=await rpc('tools/call',{name:'calculate_estimate',arguments:{requests:2000,latencyMs:250,costPerRequest:0.002}});assert.equal(calc.result.structuredContent.totalCost,4);assert.equal(calc.result.structuredContent.sequentialSeconds,500);checks++;
const examples=await rpc('tools/call',{name:'get_examples',arguments:{}});assert.equal(examples.result.structuredContent.examples.length,3);checks++;
const templates=await rpc('tools/call',{name:'list_embed_templates',arguments:{}});assert.equal(templates.result.structuredContent.templates.length,5);assert.ok(templates.result.structuredContent.templates.every(t=>t.sourceUrl.startsWith('https://dribbble.com/shots/')));checks++;
const builder=await rpc('tools/call',{name:'open_template_builder',arguments:{template:'fleet',theme:'dark'}});assert.equal(builder.result.structuredContent.selection.template,'fleet');assert.equal(builder.result.structuredContent.selection.theme,'dark');checks++;
const bad=await rpc('tools/call',{name:'calculate_estimate',arguments:{requests:-1,latencyMs:250,costPerRequest:0.002}});assert.ok(bad.result?.isError||bad.error);checks++;
const unknown=await rpc('tools/call',{name:'unknown',arguments:{}});assert.ok(unknown.result?.isError||unknown.error);checks++;
const resources=await rpc('resources/list');assert.equal(resources.result.resources.length,1);checks++;
const resource=await rpc('resources/read',{uri:'ui://starter/dashboard.html'});assert.equal(resource.result.contents[0].mimeType,'text/html;profile=mcp-app');assert.ok(resource.result.contents[0].text.includes('estimate-form'));checks++;
const origin=await POST(new Request('https://example.test/mcp',{method:'POST',headers:{Origin:'https://chatgpt.com','Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'})}));assert.equal(origin.status,200);assert.equal(origin.headers.get('access-control-allow-origin'),'*');checks++;
const preflight=OPTIONS();assert.equal(preflight.status,204);assert.match(preflight.headers.get('access-control-allow-headers')??'',/MCP-Protocol-Version/);checks++;
const huge=await POST(new Request('https://example.test/mcp',{method:'POST',headers:{'Content-Type':'application/json'},body:'x'.repeat(32769)}));assert.equal(huge.status,413);checks++;
const malformed=await POST(new Request('https://example.test/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:'{bad'}));assert.equal(malformed.status,400);checks++;
assert.equal(GET().status,405);checks++;
console.log(`${checks} protocol and security checks passed`);
}finally{await rm(dir,{recursive:true,force:true})}
