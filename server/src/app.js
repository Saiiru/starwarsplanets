import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { createStore } from './store.js'
import { ERAS, FACTIONS, PLANETS, SHIPS, planetRecord } from '../../src/data/galactic-registry.js'
import {planQuestion,executeQuestionPlan,loreSearch} from '../../src/ai/query-core.js'
import {readLocalModelConfig,routeWithLocalModel} from './llm-router.js'
import {performance} from 'node:perf_hooks'

const errorStatus={unauthorized:401,forbidden:403,'not-found':404,invalid:400,insufficient:409,duplicate:409,'duplicate-other':409}
const errorMessage={unauthorized:'Sessão requerida.',forbidden:'Permissão insuficiente.','not-found':'Registro não encontrado.',
 invalid:'Dados inválidos.',insufficient:'Quantidade ou disponibilidade insuficiente.',duplicate:'Identificador já utilizado.','duplicate-other':'Identificador já utilizado.'}
const errorReply=(reply,err)=>reply.code(errorStatus[err]||500).send({error:err,message:errorMessage[err]||'Falha interna.'})

export async function buildApp({dbPath=':memory:',bootstrapUsername,bootstrapPassword,logger=false,llmConfig=undefined,modelFetcher=fetch}={}) {
 const store=createStore({dbPath,bootstrapUsername,bootstrapPassword})
 const model=llmConfig===undefined?readLocalModelConfig():llmConfig
 const app=Fastify({logger,bodyLimit:16*1024,trustProxy:false,ajv:{customOptions:{removeAdditional:false}}})
 app.addHook('onClose',async()=>store.close())
 await app.register(helmet)
 await app.register(rateLimit,{global:true,max:120,timeWindow:'1 minute',enableDraftSpec:true})
 app.addHook('onSend',async(request,reply,payload)=>{
   if(request.url.startsWith('/api/v1/'))reply.header('Cache-Control','no-store')
   return payload
 })
 const mustAuth=async(request,reply)=>{
   const match=/^Bearer ([0-9a-f]{64})$/.exec(request.headers.authorization||'')
   const actor=match?store.findUser(match[1]):null
   if(!actor){reply.code(401).send({error:'unauthorized',message:'Token ausente ou expirado.'});return}
   request.actor=actor
   request.authToken=match[1]
 }
 const requireAdmin=async(request,reply)=>{
   await mustAuth(request,reply)
   if(reply.sent)return
   if(request.actor.role!=='admin')reply.code(403).send({error:'forbidden',message:'Administração necessária.'})
 }
 app.get('/api/v1/health',async(_req,reply)=>{
   try {store.db.prepare('SELECT COUNT(*) AS total FROM inventory').get();return {status:'ok',service:'holonet-fleet-api',storage:'sqlite'}}
   catch{return reply.code(503).send({status:'unavailable'})}
 })
 app.get('/api/v1/catalog',async()=>({
   eras:ERAS,factions:FACTIONS,ships:SHIPS,
   provenance:'Curadoria Canon com links StarWars.com; valores da frota são simulação, nunca dados históricos.'
 }))
 app.get('/api/v1/planets',{
   schema:{querystring:{type:'object',properties:{era:{type:'string',enum:ERAS.map(e=>e.id)}},additionalProperties:false}}
 },async(request)=>{
   const era=request.query.era||ERAS[1].id
   return {era,planets:PLANETS.map(p=>({id:p.id,name:p.name,region:p.region,...planetRecord(p,era)})),note:'Dados históricos variam por era; UNKNOWN significa não verificado, não planeta sem facção.'}
 })
 app.get('/api/v1/fleet',{
   schema:{querystring:{type:'object',properties:{era:{type:'string',enum:ERAS.map(e=>e.id)}},additionalProperties:false}}
 },async(request)=>({source:'scenario-synthetic',label:'Inventário didático inventado',
     rows:store.inventory(request.query.era)}))
 app.get('/api/v1/ai/status',async()=>({
   available:!!model,provider:model?'local-openai-compatible':'none',readOnly:true,
   writesAllowed:false,retrieval:'lexical-curated-records',tokenRequired:false
 }))
 app.get('/api/v1/lore/search',{
   schema:{querystring:{type:'object',required:['q'],additionalProperties:false,
     properties:{q:{type:'string',minLength:3,maxLength:200},
       era:{type:'string',enum:ERAS.map(e=>e.id)}}}}
 },async(request)=>({
   technique:'lexical-keyword',claim:'Não usa embeddings nem banco vetorial.',
   matches:loreSearch(request.query.q,request.query.era||ERAS[1].id)
 }))
 app.post('/api/v1/ask',{
   config:{rateLimit:{max:25,timeWindow:'1 minute'}},
   schema:{body:{type:'object',required:['question'],additionalProperties:false,properties:{
     question:{type:'string',minLength:3,maxLength:500},
     era:{type:'string',enum:ERAS.map(e=>e.id)},
     mode:{type:'string',enum:['rules','llm']}
   }}}
 },async(request)=>{
   const started=performance.now()
   const {question,era=ERAS[1].id,mode='rules'}=request.body
   const context={era}
   const rule=planQuestion(question,context)
   let routing='rules',modelMeta=null,selected=rule,fallback=null
   // Safety denial occurs before invoking any model.
   if(mode==='llm'&&rule.intent!=='blocked'){
     const ai=await routeWithLocalModel(question,context,{config:model,fetcher:modelFetcher})
     modelMeta={available:!!model,reason:ai.reason,model:model?.model||null,
       latencyMs:ai.latencyMs,usage:ai.usage}
     if(ai.plan){selected=ai.plan;routing='llm-tool'}
     else{fallback=ai.reason;routing='rules-fallback'}
   }
   const result=executeQuestionPlan(selected,{rows:store.inventory()})
   return { ...result,route:routing,tool:selected.intent,model:modelMeta,
     fallback,latencyMs:Math.round((performance.now()-started)*100)/100,
     guarantees:{readOnly:true,writesAllowed:false},
     provenance:result.evidence==='simulated'?'synthetic-inventory':result.evidence==='canon'?'curated-lore':'insufficient-evidence'}
 })
 app.post('/api/v1/auth/login',{
   config:{rateLimit:{max:6,timeWindow:'1 minute'}},
   schema:{body:{type:'object',required:['username','password'],additionalProperties:false,properties:{
     username:{type:'string',minLength:1,maxLength:80},
     password:{type:'string',minLength:1,maxLength:512}
   }}}
 },async(request,reply)=>{
   const session=store.login(request.body.username,request.body.password)
   if(!session) return reply.code(401).send({error:'unauthorized',message:'Credenciais inválidas.'})
   return session
 })
 app.post('/api/v1/auth/logout',{preHandler:mustAuth},async(request)=>{store.logout(request.authToken);return {ok:true}})
 app.get('/api/v1/auth/me',{preHandler:mustAuth},async(request)=>({user:request.actor}))
 app.post('/api/v1/users',{
   preHandler:requireAdmin,
   schema:{body:{type:'object',required:['username','password','role'],additionalProperties:false,properties:{
     username:{type:'string',minLength:3,maxLength:40},
     password:{type:'string',minLength:12,maxLength:512},
     role:{type:'string',enum:['admin','operator','viewer']},
     factionScope:{anyOf:[{type:'string',enum:['REPUBLIC','CIS','EMPIRE','ALLIANCE']},{type:'null'}]}
   }}}
 },async(request,reply)=>{
   const result=store.createUser(request.actor,request.body)
   if(result.error)return errorReply(reply,result.error)
   return reply.code(201).send(result)
 })
 app.get('/api/v1/users',{preHandler:requireAdmin},async()=>({users:store.users()}))
 app.get('/api/v1/audit',{preHandler:requireAdmin},async()=>({events:store.audit()}))
 app.get('/api/v1/movements',{preHandler:mustAuth},async(request)=>{
   const events=store.movements()
   return {movements:request.actor.role==='admin'?events:events.filter(m=>m.faction===request.actor.faction_scope)}
 })
 app.post('/api/v1/transfer',{
   preHandler:mustAuth,
   schema:{body:{type:'object',required:['requestId','fromId','toPlanet','quantity','reason'],additionalProperties:false,properties:{
     requestId:{type:'string',minLength:10,maxLength:80},
     fromId:{type:'string',minLength:1,maxLength:100},
     toPlanet:{type:'string',minLength:1,maxLength:90},
     quantity:{type:'integer',minimum:1,maximum:100000},
     ready:{type:'integer',minimum:0,maximum:100000},
     reason:{type:'string',minLength:8,maxLength:400}
   }}}
 },async(request,reply)=>{
   const result=store.transfer({...request.body,user:request.actor})
   if(result.error)return errorReply(reply,result.error)
   return reply.code(result.replayed?200:201).send(result)
 })
 app.post('/api/v1/inventory/adjust',{
   preHandler:requireAdmin,
   schema:{body:{type:'object',required:['id','delta','readyDelta','reason'],additionalProperties:false,properties:{
     id:{type:'string',minLength:1,maxLength:100},
     delta:{type:'integer',minimum:-100000,maximum:100000},
     readyDelta:{type:'integer',minimum:-100000,maximum:100000},
     reason:{type:'string',minLength:8,maxLength:400}
   }}}
 },async(request,reply)=>{
   const result=store.adjust({...request.body,user:request.actor})
   if(result.error)return errorReply(reply,result.error)
   return result
 })
 return {app,store}
}
