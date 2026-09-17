import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';
import { examples, toolDefinitions, RESOURCE_URI } from './catalog';
import { widgetHtml } from './widget.generated';
import { dashboardTemplates } from './templates';
export const estimateSchema=z.object({requests:z.number().int().min(1).max(1000000),latencyMs:z.number().min(0).max(600000),costPerRequest:z.number().min(0).max(1000)}).strict();
export function estimate(input:unknown){const a=estimateSchema.parse(input);return {...a,totalCost:Math.round(a.requests*a.costPerRequest*1e6)/1e6,sequentialSeconds:a.requests*a.latencyMs/1000,currency:'USD',assumptions:'User supplied estimates, not measured performance or provider pricing.'};}
const result=(data:Record<string,unknown>)=>({content:[{type:'text' as const,text:JSON.stringify(data)}],structuredContent:data});
export function createServer(){
 const server=new McpServer({name:'mcp-studio',version:'1.0.0'});
 registerAppTool(server,'show_dashboard',{title:toolDefinitions[0].title,description:toolDefinitions[0].description,inputSchema:z.object({}).strict(),annotations:toolDefinitions[0].annotations,_meta:toolDefinitions[0]._meta!},async()=>result({title:'Your plugin, in the conversation',examples,estimate:estimate({requests:1000,latencyMs:250,costPerRequest:0.002})}));
 server.registerTool('get_examples',{title:toolDefinitions[1].title,description:toolDefinitions[1].description,inputSchema:z.object({}).strict(),annotations:toolDefinitions[1].annotations},async()=>result({examples}));
 server.registerTool('calculate_estimate',{title:toolDefinitions[2].title,description:toolDefinitions[2].description,inputSchema:estimateSchema,annotations:toolDefinitions[2].annotations},async a=>result(estimate(a)));
 server.registerTool('list_embed_templates',{title:toolDefinitions[3].title,description:toolDefinitions[3].description,inputSchema:z.object({}).strict(),annotations:toolDefinitions[3].annotations},async()=>result({templates:dashboardTemplates}));
 registerAppTool(server,'open_template_builder',{title:toolDefinitions[4].title,description:toolDefinitions[4].description,inputSchema:z.object({template:z.enum(['analytics','commerce','fleet','clinic','fintech']).optional(),theme:z.enum(['light','dark']).optional()}).strict(),annotations:toolDefinitions[4].annotations,_meta:toolDefinitions[4]._meta!},async (input:{template?:'analytics'|'commerce'|'fleet'|'clinic'|'fintech';theme?:'light'|'dark'})=>result({view:'template-builder',selection:{template:input.template??'analytics',theme:input.theme??'light'},templates:dashboardTemplates}));
 registerAppResource(server,'starter-dashboard',RESOURCE_URI,{},async()=>({contents:[{uri:RESOURCE_URI,mimeType:RESOURCE_MIME_TYPE,text:widgetHtml,_meta:{ui:{prefersBorder:true,csp:{connectDomains:[],resourceDomains:[]}},'openai/widgetDescription':'Starter dashboard with example patterns and an interactive usage calculator.','openai/widgetPrefersBorder':true,'openai/widgetCSP':{connect_domains:[],resource_domains:[]}}}]}));
 return server;
}
