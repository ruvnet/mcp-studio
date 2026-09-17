export const RESOURCE_URI='ui://starter/dashboard.html';
const readOnly={readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false};

export const toolDefinitions=[
 {name:'show_dashboard',title:'Interactive dashboard',description:'Open the starter UI with examples and an editable cost estimate.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:readOnly,_meta:{ui:{resourceUri:RESOURCE_URI},'openai/outputTemplate':RESOURCE_URI,'openai/widgetAccessible':true}},
 {name:'get_examples',title:'Browse examples',description:'Get reusable patterns for tools, resources, prompts, completions, and UI.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:readOnly},
 {name:'calculate_estimate',title:'Usage calculator',description:'Calculate total cost and sequential duration from supplied assumptions.',inputSchema:{type:'object',properties:{requests:{type:'integer',minimum:1,maximum:1000000},latencyMs:{type:'number',minimum:0,maximum:600000},costPerRequest:{type:'number',minimum:0,maximum:1000}},required:['requests','latencyMs','costPerRequest'],additionalProperties:false},annotations:readOnly},
 {name:'list_embed_templates',title:'List embed templates',description:'Return five attributed dashboard templates for ChatGPT MCP embeds.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:readOnly},
 {name:'open_template_builder',title:'Open template builder',description:'Open the interactive MCP embed template builder in the conversation.',inputSchema:{type:'object',properties:{template:{type:'string',enum:['analytics','commerce','fleet','clinic','fintech']},theme:{type:'string',enum:['light','dark']}},additionalProperties:false},annotations:readOnly,_meta:{ui:{resourceUri:RESOURCE_URI},'openai/outputTemplate':RESOURCE_URI,'openai/widgetAccessible':true}},
 {name:'search_catalog',title:'Search MCP catalog',description:'Search tools, resources, templates, and prompts by keyword.',inputSchema:{type:'object',properties:{query:{type:'string',minLength:1,maxLength:80},kind:{type:'string',enum:['all','tool','resource','template','prompt']}},required:['query'],additionalProperties:false},annotations:readOnly},
 {name:'inspect_capabilities',title:'Inspect server capabilities',description:'Return the protocol surfaces and optional features implemented by this server.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:readOnly},
 {name:'validate_tool_input',title:'Validate tool input',description:'Validate example arguments without invoking the selected tool.',inputSchema:{type:'object',properties:{toolName:{type:'string'},input:{type:'object'}},required:['toolName','input'],additionalProperties:false},annotations:readOnly},
 {name:'estimate_context_budget',title:'Estimate context budget',description:'Estimate token utilization for a set of MCP resources before injection.',inputSchema:{type:'object',properties:{resourceCount:{type:'integer',minimum:1,maximum:1000},averageTokens:{type:'integer',minimum:1,maximum:1000000},contextWindow:{type:'integer',minimum:1000,maximum:10000000}},required:['resourceCount','averageTokens','contextWindow'],additionalProperties:false},annotations:readOnly},
 {name:'plan_workflow',title:'Plan MCP workflow',description:'Return a deterministic sequence of tools, resources, and prompts for a common goal.',inputSchema:{type:'object',properties:{goal:{type:'string',enum:['build','audit','debug','optimize']}},required:['goal'],additionalProperties:false},annotations:readOnly},
 {name:'get_resource_examples',title:'Get resource examples',description:'Return concrete mcp:// URIs and parameterized templates with usage notes.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:readOnly},
 {name:'get_security_checklist',title:'Get security checklist',description:'Return a production review checklist for MCP tools, resources, and UI.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:readOnly},
] as const;

export const resourceDefinitions=[
 {uri:RESOURCE_URI,name:'starter-dashboard',title:'Interactive MCP Studio dashboard',description:'Self contained MCP App UI shared by render tools.',mimeType:'text/html;profile=mcp-app'},
 {uri:'mcp://studio/manifest',name:'server-manifest',title:'Server manifest',description:'Machine readable inventory of protocol surfaces.',mimeType:'application/json'},
 {uri:'mcp://studio/tools/catalog',name:'tool-catalog',title:'Tool catalog',description:'Schemas, annotations, and metadata for every example tool.',mimeType:'application/json'},
 {uri:'mcp://studio/templates/catalog',name:'template-catalog',title:'Embed template catalog',description:'Attributed UI templates and supported themes.',mimeType:'application/json'},
 {uri:'mcp://studio/examples/tool-call',name:'tool-call-example',title:'Tool call example',description:'A complete JSON RPC tool invocation and structured result.',mimeType:'text/markdown'},
 {uri:'mcp://studio/examples/resource-flow',name:'resource-flow-example',title:'Resource flow example',description:'Discover, complete, read, and link resources.',mimeType:'text/markdown'},
 {uri:'mcp://studio/security/checklist',name:'security-checklist',title:'Security checklist',description:'Validation, authorization, confirmation, and data handling gates.',mimeType:'text/markdown'},
 {uri:'mcp://studio/schemas/tool-result',name:'tool-result-schema',title:'Structured tool result schema',description:'JSON Schema for a representative MCP structured result.',mimeType:'application/schema+json'},
] as const;

export const resourceTemplateDefinitions=[
 {uriTemplate:'mcp://studio/tool/{name}',name:'tool-reference',title:'Tool reference',description:'Detailed reference for one registered tool.',mimeType:'application/json'},
 {uriTemplate:'mcp://studio/template/{id}',name:'embed-template-reference',title:'Embed template reference',description:'Detailed reference for one dashboard template.',mimeType:'application/json'},
 {uriTemplate:'mcp://studio/docs/{topic}',name:'protocol-topic',title:'Protocol topic guide',description:'Focused guidance for tools, resources, prompts, completions, or security.',mimeType:'text/markdown'},
] as const;

export const promptDefinitions=[
 {name:'design_mcp_tool',title:'Design an MCP tool',description:'Design a narrow, schema first, governable MCP tool.'},
 {name:'audit_mcp_server',title:'Audit an MCP server',description:'Review contracts, security, interoperability, and operations.'},
 {name:'plan_mcp_app',title:'Plan an MCP App',description:'Plan a tool plus UI resource with progressive enhancement.'},
] as const;

export const examples=[
 {name:'Typed tool',detail:'Validate input and output with JSON Schema and honest annotations.'},
 {name:'Resource link',detail:'Return URI addressed context that clients can fetch only when needed.'},
 {name:'Resource template',detail:'Expose parameterized URIs with completion for discoverability.'},
 {name:'Prompt template',detail:'Provide user controlled, reusable workflows with validated arguments.'},
 {name:'MCP App',detail:'Attach a focused UI resource while preserving a text and structured fallback.'},
];
