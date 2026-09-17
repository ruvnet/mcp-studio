import { App } from '@modelcontextprotocol/ext-apps';
const web=new URLSearchParams(location.search).get('mode')==='web';
const app=new App({name:'MCP Studio',version:'1.0.0'},{},{autoResize:true});
const el=(id:string)=>document.getElementById(id)!;
let ready=web;
let latest:Record<string,unknown>|undefined;
async function call(name:string,args:Record<string,unknown>={}){
 if(!ready)throw Error('Host is not connected yet.');
 if(!web)return app.callServerTool({name,arguments:args});
 const response=await fetch('/api/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:Date.now(),method:'tools/call',params:{name,arguments:args}})});const data:any=await response.json();if(data.error)throw Error(data.error.message);return data.result;
}
function chooseTemplate(template:any){document.querySelectorAll('.templatecard').forEach(x=>x.classList.toggle('active',(x as HTMLElement).dataset.id===template.id));el('template-name').textContent=template.name;el('template-desc').textContent=template.description;const source=el('template-source') as HTMLAnchorElement;source.href=template.sourceUrl;source.textContent=`Inspired by ${template.author} on Dribbble ↗`;}
function showTemplates(data:any){const templates=data.templates??[];if(!templates.length)return;el('starter').setAttribute('hidden','');el('templates').classList.add('active');const grid=el('template-grid');grid.replaceChildren(...templates.map((template:any)=>{const button=document.createElement('button');button.className='templatecard';button.dataset.id=template.id;button.style.setProperty('--accent',template.accent);button.innerHTML=`<i></i><b>${template.name}</b><small>${template.category}</small>`;button.addEventListener('click',()=>chooseTemplate(template));return button}));chooseTemplate(templates.find((x:any)=>x.id===data.selection?.template)??templates[0]);if(data.selection?.theme)document.documentElement.dataset.theme=data.selection.theme;}
function show(data:any){if(!data)return;if(data.view==='template-builder'||data.templates)showTemplates(data);const a=data.estimate??data;if(typeof a.totalCost==='number'){latest=a;el('cost').textContent='$'+a.totalCost.toFixed(2);el('duration').textContent=a.sequentialSeconds.toFixed(1)+'s';el('requests').textContent=Number(a.requests).toLocaleString();} }
function report(error:unknown){el('status').textContent=String(error)}
app.ontoolresult=result=>show(result.structuredContent);
app.onhostcontextchanged=context=>{if(context.theme)document.documentElement.dataset.theme=context.theme};
(async()=>{try{if(web){el('mode').textContent='BROWSER MODE';show((await call('show_dashboard')).structuredContent)}else{await app.connect();ready=true;el('mode').textContent='HOST CONNECTED';if(app.getHostContext()?.theme)document.documentElement.dataset.theme=app.getHostContext()!.theme;}el('status').textContent='Ready to run your own assumptions.';if(!web)el('followup').removeAttribute('hidden')}catch(e){report(e)}})();
el('calculate').addEventListener('click',async e=>{e.preventDefault();if(!(el('estimate-form') as HTMLFormElement).reportValidity())return;const button=el('calculate') as HTMLButtonElement;button.disabled=true;el('status').textContent='Calculating…';try{const args={requests:Number((el('requests-input') as HTMLInputElement).value),latencyMs:Number((el('latency-input') as HTMLInputElement).value),costPerRequest:Number((el('cost-input') as HTMLInputElement).value)};const result=await call('calculate_estimate',args);if(result.isError)throw Error(result.content?.[0]?.text??'Tool rejected the request');show(result.structuredContent);el('status').textContent='Calculated from your inputs. No model tokens used.'}catch(e){report(e)}finally{button.disabled=false}});
el('followup').addEventListener('click',async()=>{try{await app.sendMessage({role:'user',content:[{type:'text',text:'Explain these usage assumptions and their limitations: '+JSON.stringify(latest??{})}]});el('status').textContent='Explanation requested in the conversation.'}catch(e){report(e)}});
el('light-theme').addEventListener('click',()=>document.documentElement.dataset.theme='light');
el('dark-theme').addEventListener('click',()=>document.documentElement.dataset.theme='dark');
