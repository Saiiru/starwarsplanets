import {performance} from 'node:perf_hooks'
import {extractEntities, planQuestion, safeQuestionTools} from '../../src/ai/query-core.js'
import {ERAS, PLANETS, SHIPS, FACTIONS} from '../../src/data/galactic-registry.js'

const eras=ERAS.map(v=>v.id),planets=PLANETS.map(v=>v.id),ships=SHIPS.map(v=>v.id)
const factions=Object.keys(FACTIONS)
const descriptions={
 stock:'Consulta inventário fictício de frota por planeta, classe de nave, facção e era. Nunca escreve dados.',
 affiliation:'Consulta controle e alinhamento político de um planeta em uma época, com fonte Canon.',
 lore:'Recupera registro de lore documentado por planeta e período, com citação.',
 compare:'Compara as quantidades simuladas de frota entre facções de um período.',
 ships:'Lista classes de naves registradas em uma era e opcionalmente uma facção.'
}
const nullableEnum=values=>({type:['string','null'],enum:[...values,null]})
const tools=safeQuestionTools.map(intent=>({
 type:'function',function:{
  name:intent,description:descriptions[intent],
  parameters:{type:'object',additionalProperties:false,properties:{
   era:{type:'string',enum:eras},planet:nullableEnum(planets),
   ship:nullableEnum(ships),faction:nullableEnum(factions),
   ready:{type:'boolean'}
  },required:['era','planet','ship','faction','ready']}
 }
}))

export function readLocalModelConfig({baseUrl=process.env.HOLONET_LLM_BASE_URL,model=process.env.HOLONET_LLM_MODEL}={}){
 if(!model)return null
 const url=new URL(baseUrl||'http://127.0.0.1:8080/v1/chat/completions')
 const host=url.hostname.replace(/^\[|\]$/g,'')
 // Only a loopback service is allowed. Reject accidental cloud URLs and credentials in URL.
 if(url.protocol!=='http:'||!['127.0.0.1','localhost','::1'].includes(host)||
   url.pathname!=='/v1/chat/completions'||url.username||url.password||url.search||url.hash||
   typeof model!=='string'||model.length>100||!/^[-\w./:]+$/.test(model)) {
  throw new Error('HOLO-NET aceita somente modelos OpenAI-compatible no loopback local, via /v1/chat/completions.')
 }
 return {url:url.href,model}
}
const validPlan=(plan,detected)=>{
 if(!safeQuestionTools.includes(plan.intent)||!eras.includes(plan.era))return false
 if(plan.planet && !planets.includes(plan.planet))return false
 if(plan.ship && !ships.includes(plan.ship))return false
 if(plan.faction && !factions.includes(plan.faction))return false
 if(plan.era!==detected.era)return false
 for(const key of ['planet','ship','faction']){
  if(detected[key] && plan[key]!==detected[key])return false
 }
 return true
}
export async function routeWithLocalModel(question,context,{config=readLocalModelConfig(),fetcher=fetch}={}){
 if(!config)return {plan:null,reason:'not-configured',usage:null,latencyMs:0}
 const detected=extractEntities(question,context)
 const baseline=planQuestion(question,context)
 if(baseline.intent==='abstain'&&!detected.planet&&!detected.ship&&!detected.faction) return {plan:null,reason:'unknown-scope',usage:null,latencyMs:0}
 const started=performance.now()
 const messages=[
  {role:'system',content:'Você é um roteador de ferramentas de leitura para um sistema de logística ficcional de Star Wars. '+
   'Escolha UMA ferramenta para responder à pergunta. Não escreva comandos ou movimentações. '+
   'Nunca invente quantidades, afiliações ou IDs. '+
   'As entidades identificadas deterministicamente são autoritativas: '+JSON.stringify({era:detected.era,planet:detected.planet,ship:detected.ship,faction:detected.faction,ready:detected.ready})+
   '. Se não houver dados suficientes, não chame nenhuma ferramenta.'},
  {role:'user',content:question}
 ]
 try{
  const response=await fetcher(config.url,{
   method:'POST',signal:AbortSignal.timeout(7000),
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({model:config.model,messages,tools,stream:false,temperature:0,max_tokens:280})
  })
  if(!response.ok)throw new Error('http-'+response.status)
  const payload=await response.json()
  const calls=payload.choices?.[0]?.message?.tool_calls
  if(!Array.isArray(calls)||calls.length!==1)return {plan:null,reason:'no-single-tool',usage:payload.usage||null,latencyMs:Math.round(performance.now()-started)}
  const call=calls[0]
  if(call.type!=='function'||!safeQuestionTools.includes(call.function?.name))return {plan:null,reason:'tool-not-allowed',usage:payload.usage||null,latencyMs:Math.round(performance.now()-started)}
  let args
  try{args=JSON.parse(call.function.arguments)}catch{return {plan:null,reason:'invalid-json',usage:payload.usage||null,latencyMs:Math.round(performance.now()-started)}}
  const plan={intent:call.function.name,era:args.era,planet:args.planet||null,ship:args.ship||null,
   faction:args.faction||null,ready:args.ready===true}
  if((baseline.intent!=='abstain'&&baseline.intent!==plan.intent &&
    !(baseline.intent==='lore'&&plan.intent==='affiliation') &&
    !(baseline.intent==='affiliation'&&plan.intent==='lore')) || !validPlan(plan,detected))return {plan:null,reason:'arguments-rejected',usage:payload.usage||null,latencyMs:Math.round(performance.now()-started)}
  return {plan,reason:'accepted',usage:payload.usage||null,latencyMs:Math.round(performance.now()-started)}
 }catch{
  return {plan:null,reason:'local-model-unavailable',usage:null,latencyMs:Math.round(performance.now()-started)}
 }
}
export function shouldDenyQuestion(question,context){
 const plan=planQuestion(question,context)
 return plan.intent==='blocked'?plan:null
}
