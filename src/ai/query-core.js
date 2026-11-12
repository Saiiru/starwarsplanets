import {ERAS,FACTIONS,PLANETS,SHIPS,planetRecord} from '../data/galactic-registry.js'
import {normalizeName} from '../data/galactic-views.js'

const norm=value=>normalizeName(String(value||''))
const match=(text,s)=>(' '+text+' ').includes(' '+s+' ')
const alias=(text,lookup)=>Object.entries(lookup).filter(([key])=>match(text,key))
  .sort((a,b)=>b[0].length-a[0].length)[0]?.[1]||null
const planetAliases={'yavin 4':'yavin-4','yavin iv':'yavin-4','mon calamari':'mon-cala','mon cala':'mon-cala'}
const shipAliases={'x wings':'x-wing','x wing':'x-wing','xwing':'x-wing','t 65':'x-wing',
 'tie fighters':'tie-ln','tie fighter':'tie-ln','tie ln':'tie-ln',
 'tie interceptors':'tie-in','tie interceptor':'tie-in',
 'imperial star destroyer':'isd','destruidor estelar imperial':'isd',
 'venator':'venator','arc 170':'arc-170','vulture droid':'vulture',
 'y wing':'y-wing','y wings':'y-wing','b wing':'b-wing','a wing':'a-wing',
 'cruzador mon calamari':'mc80','nebulon b':'nebulon-b','laat':'laat'}
const factionAliases={'imperio':'EMPIRE','imperial':'EMPIRE','imperiais':'EMPIRE',
 'republica':'REPUBLIC','republicanos':'REPUBLIC','alianca rebelde':'ALLIANCE',
 'alianca':'ALLIANCE','rebeldes':'ALLIANCE','rebelde':'ALLIANCE','separatistas':'CIS','separatista':'CIS'}
const eras=new Set(ERAS.map(x=>x.id)),worlds=new Set(PLANETS.map(x=>x.id))
const ships=new Set(SHIPS.map(x=>x.id)),factions=new Set(Object.keys(FACTIONS))
const byId=(items,id)=>items.find(x=>x.id===id)
const num=new Intl.NumberFormat('pt-BR')
const nameFaction=id=>FACTIONS[id]?.label||'Indeterminado'
const fleetEvidence=()=>[{type:'simulation',label:'Inventário fictício de treinamento',url:null}]
const factualEvidence=r=>r.source?[{type:'canon',label:'Star Wars Databank (Lucasfilm)',url:r.source}]:[]
const unknown=answer=>({status:'unknown',intent:'abstain',answer,data:null,sources:[],evidence:'insufficient',notes:[]})
export const normalizeQuestion=norm

export function extractEntities(question,{era='GALACTIC_CIVIL_WAR'}={}){
 const text=norm(question)
 const planet=alias(text,planetAliases)||PLANETS.filter(p=>match(text,norm(p.name)))
   .sort((a,b)=>b.name.length-a.name.length)[0]?.id||null
 const ship=alias(text,shipAliases)||SHIPS.filter(s=>match(text,norm(s.name)))
   .sort((a,b)=>b.name.length-a.name.length)[0]?.id||null
 let chosen=eras.has(era)?era:'GALACTIC_CIVIL_WAR'
 if(/guerras clonicas|guerra dos clones|clone wars|22 bby/.test(text))chosen='CLONE_WARS'
 if(/guerra civil galactica|galactic civil war|imperio galactico|4 aby/.test(text))chosen='GALACTIC_CIVIL_WAR'
 return {text,era:chosen,planet,ship,faction:alias(text,factionAliases),
   ready:/\b(prontos?|prontas?|disponiveis?|operacionais?|aptos?|aptas?)\b/.test(text)}
}
const forbidden=/\b(transferir|transfira|transferencia|mover|mova|movimentar|adicionar|adicione|editar|edite|alterar|altere|apagar|apague|excluir|exclua|remover|remova|registrar|registre|criar|crie|deletar|delete|senhas?|tokens?|credenciais?|login|hackear|ignore as regras|ignorar regras)\b/
export function planQuestion(question,context={}){
 if(typeof question!=='string'||question.trim().length<3||question.length>500)
   return {intent:'abstain',reason:'Escreva uma pergunta com 3 a 500 caracteres.'}
 const e=extractEntities(question,context),t=e.text
 if(forbidden.test(t))return {intent:'blocked',reason:'A consulta por linguagem natural é somente leitura. Alterações exigem interface autenticada e confirmação.'}
 if(/\b(compare|comparar|comparacao|versus|vs|diferenca|mais naves|quem tem mais)\b/.test(t))return {intent:'compare',...e}
 if(e.planet&&/\b(quem controla|controlava|domina|dominava|pertence|pertencia|alinhamento|faccao|soberania|ocupacao|governava|governa)\b/.test(t))
   return {intent:'affiliation',...e}
 if(e.planet&&/\b(lore|historia|historico|explique|por que|aconteceu|conflito|ocupado|ocupacao|fonte|fontes)\b/.test(t))
   return {intent:'lore',...e}
 if(/\b(quais|liste|lista|modelos|tipos|classe|classes)\b/.test(t)&&/\b(naves?|cacas?|frotas?|estelares?|modelos?)\b/.test(t))
   return {intent:'ships',...e}
 if(e.ship||/\b(quantos|quantas|estoque|frota|unidades|disponiveis|prontas|naves|cacas|resumo)\b/.test(t))
   return {intent:'stock',...e}
 if(e.planet)return {intent:'lore',...e}
 return {intent:'abstain',reason:'Não reconheci uma consulta sobre o inventário, classes de naves ou histórico de planetas.'}
}
export const safeQuestionTools=Object.freeze(['stock','affiliation','lore','compare','ships'])
export function executeQuestionPlan(plan,{rows=[]}={}){
 if(plan.intent==='blocked')return {status:'blocked',intent:'blocked',answer:plan.reason,data:null,sources:[],evidence:'none',notes:[]}
 if(plan.intent==='abstain')return unknown(plan.reason)
 if(!safeQuestionTools.includes(plan.intent)||!eras.has(plan.era)||plan.planet&&!worlds.has(plan.planet)
  ||plan.ship&&!ships.has(plan.ship)||plan.faction&&!factions.has(plan.faction))return unknown('Parâmetros fora dos catálogos autorizados.')
 const eraName=byId(ERAS,plan.era).label
 if(plan.intent==='affiliation'||plan.intent==='lore'){
  const p=byId(PLANETS,plan.planet)
  if(!p)return unknown('Indique um planeta reconhecido no catálogo curado.')
  const r=planetRecord(p,plan.era)
  if(r.control==='UNKNOWN')return {status:'unknown',intent:plan.intent,answer:'Não há evidência suficiente do controle de '+p.name+' em '+eraName+'. Não vou presumir uma facção.',
   data:{planet:p.id,era:plan.era,control:'UNKNOWN'},sources:factualEvidence(r),evidence:'insufficient',notes:['Desconhecido não significa neutro.']}
  return {status:'answered',intent:plan.intent,
   answer:'Em '+eraName+', '+p.name+' aparece sob controle de **'+nameFaction(r.control)+'**. Alinhamento registrado: **'+nameFaction(r.alignment)+'**. '+r.summary,
   data:{planet:p.id,era:plan.era,control:r.control,alignment:r.alignment,confidence:r.confidence},sources:factualEvidence(r),
   evidence:'canon',notes:['A administração pode mudar dentro de uma mesma era.']}
 }
 if(plan.intent==='stock'){
  const filtered=rows.filter(r=>r.era===plan.era&&(!plan.ship||r.ship===plan.ship)&&(!plan.planet||r.planet===plan.planet)&&(!plan.faction||r.faction===plan.faction))
  const total=filtered.reduce((sum,r)=>sum+r.quantity,0),ready=filtered.reduce((sum,r)=>sum+r.ready,0)
  const target=[plan.ship?byId(SHIPS,plan.ship)?.name:'naves',plan.planet?'em '+byId(PLANETS,plan.planet)?.name:null,
   plan.faction?'da '+nameFaction(plan.faction):null].filter(Boolean).join(' ')
  return {status:'answered',intent:'stock',
   answer:filtered.length?('No **cenário fictício** de '+eraName+', há **'+num.format(plan.ready?ready:total)+'** '+target+
    (plan.ready?' prontas para operação.':' cadastradas, das quais **'+num.format(ready)+'** estão prontas.')):
    'Não há registros de '+target+' no cenário de '+eraName+'. Isso não prova ausência dessas naves no Canon.',
   data:{era:plan.era,ship:plan.ship,planet:plan.planet,faction:plan.faction,quantity:plan.ready?ready:total,total,ready,rows:filtered.length},
   sources:fleetEvidence(),evidence:'simulated',notes:['Quantidades são inventadas para fins didáticos.']}
 }
 if(plan.intent==='compare'){
  const groups=['EMPIRE','ALLIANCE','REPUBLIC','CIS'].map(faction=>{
   const a=rows.filter(r=>r.era===plan.era&&r.faction===faction)
   return {faction,total:a.reduce((sum,r)=>sum+r.quantity,0),ready:a.reduce((sum,r)=>sum+r.ready,0),positions:a.length}
  }).filter(g=>g.positions)
  if(groups.length<2)return unknown('Não há duas facções com frotas cadastradas nesta era.')
  return {status:'answered',intent:'compare',answer:'Comparação do inventário **fictício** de '+eraName+': '+groups.map(g=>nameFaction(g.faction)+
   ' tem **'+num.format(g.total)+'** unidades ('+num.format(g.ready)+' prontas)').join('; ')+'.',
   data:{era:plan.era,groups},sources:fleetEvidence(),evidence:'simulated',notes:['Não são números históricos oficiais.']}
 }
 if(plan.intent==='ships'){
  const list=SHIPS.filter(s=>s.era===plan.era&&(!plan.faction||s.faction===plan.faction))
  if(!list.length)return unknown('Não há classes curadas para essa época e facção.')
  return {status:'answered',intent:'ships',
   answer:'Classes cadastradas em '+eraName+(plan.faction?' / '+nameFaction(plan.faction):'')+': '+list.map(s=>s.name).join('; ')+'.',
   data:{era:plan.era,faction:plan.faction,ships:list.map(s=>s.id)},sources:list.map(s=>({type:'canon',label:s.name+' — Databank',url:s.source})),
   evidence:'canon',notes:['Catalogação de um modelo não significa unidades em estoque.']}
 }
 return unknown('Consulta não reconhecida.')
}
export function answerQuestion(question,context={},resources={}){
 const plan=planQuestion(question,context)
 return {...executeQuestionPlan(plan,resources),plan}
}
export function loreSearch(query,era='GALACTIC_CIVIL_WAR',limit=4){
 const stop=new Set('sobre era quem qual quais onde quando durante para como que das dos por era controle'.split(' '))
 const terms=norm(query).split(' ').filter(t=>t.length>2&&!stop.has(t)).slice(0,10)
 return PLANETS.flatMap(p=>{
  const r=p.records.find(v=>v.era===era)
  if(!r?.source)return []
  const content=norm(p.name+' '+p.region+' '+r.summary+' '+r.status)
  const score=terms.reduce((s,t)=>s+(match(content,t)?3:content.includes(t)?1:0),0)
  return score?[{planet:p.id,title:p.name,score,excerpt:r.summary,source:r.source,era,control:r.control,alignment:r.alignment}]:[]
 }).sort((a,b)=>b.score-a.score).slice(0,limit)
}
