import React from 'react'
import {FACTIONS, PLANETS, SHIPS, planetRecord, shipById, planetById} from '../data/galactic-registry'
import {answerQuestion} from '../ai/query-core'

const positions=[
  {id:'coruscant',x:47,y:38},{id:'corellia',x:33,y:28},{id:'lothal',x:77,y:32},
  {id:'mon-cala',x:70,y:69},{id:'scarif',x:82,y:78},{id:'yavin-4',x:63,y:23},
  {id:'hoth',x:23,y:73},{id:'mandalore',x:40,y:59},{id:'geonosis',x:56,y:83}
]
const sampleQuestions=[
 'Quantos X-wings estão prontos em Yavin 4?',
 'Quem controlava Coruscant nas Guerras Clônicas?',
 'Compare as frotas do Império e da Aliança'
]
const format=new Intl.NumberFormat('pt-BR')
const normalizedResponse=s=>String(s||'').replace(/\*\*/g,'')
function SystemGlyph(){
 return <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
  <circle cx="22" cy="22" r="18"/><circle cx="22" cy="22" r="8"/>
  <path d="M22 2v12m0 16v12M2 22h12m16 0h12M8 8l8 8m12 12 8 8M36 8l-8 8M16 28l-8 8"/>
 </svg>
}
function TacticalMap({era,onSelectPlanet}){
 const pins=positions.map(pin=>({
  ...pin, planet:PLANETS.find(p=>p.id===pin.id),
  record:planetRecord(PLANETS.find(p=>p.id===pin.id),era)
 }))
 return <section className="command-map" aria-labelledby="map-heading">
  <div className="panel-toolbar"><div><span className="console-label">HOLOGRAPHIC SECTOR VIEW / RECON</span><h2 id="map-heading">Mapa de setores</h2></div>
   <span className="data-pill">9 SETORES DE EXEMPLO</span></div>
  <div className="star-chart">
   <svg className="star-chart-grid" viewBox="0 0 700 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><pattern id="deck-stars" width="63" height="68" patternUnits="userSpaceOnUse"><circle cx="12" cy="20" r=".9" fill="#a1c1dc" opacity=".23"/><circle cx="42" cy="44" r=".7" fill="#8fb1c7" opacity=".2"/></pattern></defs>
    <rect x="0" y="0" width="700" height="480" fill="url(#deck-stars)"/>
    <circle cx="340" cy="239" r="90" stroke="#526b7e" opacity=".42"/>
    <circle cx="340" cy="239" r="171" stroke="#526b7e" opacity=".31" strokeDasharray="5 8"/>
    <circle cx="340" cy="239" r="253" stroke="#526b7e" opacity=".2"/>
    <path d="M33 239H667M340 18V462" stroke="#718da8" opacity=".18" strokeDasharray="3 8"/>
    <path d="M329 184L231 140L161 350M329 184L278 286L392 398M329 184L442 104L539 154L490 338L578 382" stroke="#49c8d3" strokeWidth="1.4" opacity=".43" strokeDasharray="5 6"/>
    <path d="M8 8h50M8 8v50M692 8h-50M692 8v50M8 472h50M8 472v-50M692 472h-50M692 472v-50" stroke="#8ea9ba" strokeWidth="2" opacity=".35"/>
   </svg>
   {pins.map(pin=><button type="button" key={pin.id}
      className={'star-pin pin-'+(FACTIONS[pin.record.control]?.tone||'unknown')}
      style={{left:pin.x+'%',top:pin.y+'%'}}
      onClick={()=>onSelectPlanet(pin.planet)}
      title={'Consultar '+pin.planet.name+' no Atlas'}
      aria-label={'Consultar '+pin.planet.name+' no Atlas'}>
     <span className="star-pin-core"/><span className="star-pin-name">{pin.planet.name}</span>
    </button>)}
   <div className="map-measure">SYS // 12A–9C <span>NOT TO SCALE</span></div>
  </div>
  <div className="map-footer"><span><SystemGlyph/> SETORES COM HISTÓRICO DOCUMENTADO</span><span>Coordenadas esquemáticas, não astronômicas</span></div>
 </section>
}
function QueryDeck({era,inventory,apiOnline,onNavigate}){
 const [question,setQuestion]=React.useState(sampleQuestions[0])
 const [answer,setAnswer]=React.useState(null)
 const [busy,setBusy]=React.useState(false)
 const [error,setError]=React.useState('')
 React.useEffect(()=>{setAnswer(null);setError('')},[era])
 async function submit(event){
  event.preventDefault();setBusy(true);setError('')
  try{
   if(question.trim().length<3||question.length>500)throw Error('Pergunta deve ter entre 3 e 500 caracteres.')
   let result
   if(apiOnline){
    const response=await fetch('/api/v1/ask',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({era,question,mode:'rules'})
    })
    const body=await response.json()
    if(!response.ok)throw Error(body.message||'Consulta indisponível.')
    result=body
   }else{
    const started=performance.now()
    result={...answerQuestion(question,{era},{rows:inventory}),route:'rules-browser',
      latencyMs:Math.round((performance.now()-started)*100)/100}
   }
   setAnswer(result)
  }catch(caught){setError(caught instanceof Error?caught.message:'Consulta indisponível.')}
  finally{setBusy(false)}
 }
 return <section className="command-query" aria-labelledby="command-query-title">
  <div className="panel-toolbar"><div><span className="console-label">QUERY / EVIDENCE ENGINE</span><h2 id="command-query-title">Pergunte ao arquivo.</h2></div>
   <span className="data-pill">SOMENTE LEITURA</span></div>
  <form onSubmit={submit} className="deck-query-form">
   <label htmlFor="fleet-main-question">Consulta operacional ou histórica</label>
   <textarea id="fleet-main-question" rows="3" maxLength={500} value={question}
    onChange={e=>{setQuestion(e.target.value);setAnswer(null)}}/>
   <div className="deck-query-chips" aria-label="Consultas de exemplo">
    {sampleQuestions.map((value,i)=><button type="button" key={value}
       className={value===question?'selected':''}
       onClick={()=>{setQuestion(value);setAnswer(null)}}>{['X-WINGS','CORUSCANT','COMPARAR FROTAS'][i]}</button>)}
   </div>
   <button type="submit" disabled={busy} className="deck-ask-button">{busy?'CONSULTANDO':'EXECUTAR CONSULTA'}<span aria-hidden="true">↗</span></button>
  </form>
  {error&&<p role="alert" className="deck-query-error">{error}</p>}
  {answer&&<div className={'deck-answer deck-answer-'+answer.status} aria-live="polite">
   <div className="deck-answer-meta"><span>{answer.status==='answered'?'RESULTADO VERIFICÁVEL':answer.status==='blocked'?'OPERAÇÃO BLOQUEADA':'SEM EVIDÊNCIA SUFICIENTE'}</span><span>{answer.latencyMs} ms</span></div>
   <p>{normalizedResponse(answer.answer)}</p>
   <div className="deck-answer-sources"><span>{answer.evidence==='simulated'?'FONTE: SIMULAÇÃO':'FONTE: LORE CURADA'}</span>
    {answer.sources?.filter(source=>source.url).slice(0,1).map(source=>
      <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">Abrir evidência ↗</a>)}
   </div>
  </div>}
  <div className="deck-query-bottom"><span>REGRAS / SEM MODELO EXTERNO</span><button type="button" onClick={()=>onNavigate('ask')}>ABRIR CONSOLE COMPLETO ↗</button></div>
 </section>
}
export default function CommandDeck({era,faction,inventory,worlds,apiOnline,onNavigate,onSelectPlanet}){
 const scoped=inventory.filter(row=>row.era===era&&(faction==='ALL'||row.faction===faction))
 const total=scoped.reduce((sum,row)=>sum+row.quantity,0)
 const ready=scoped.reduce((sum,row)=>sum+row.ready,0)
 const priority=[...scoped].sort((a,b)=>b.quantity-a.quantity).slice(0,4)
 return <div className="command-deck">
  <div className="command-intro">
   <div><span className="console-label">HOLO-NET / ESTADO DO TEATRO</span>
    <h1>Controle galáctico<span>.</span></h1>
    <p>Consulte uma frota de treinamento, navegue por registros históricos e entenda cada resposta por suas fontes. O comando real de estoque está isolado no backend local.</p>
   </div>
   <div className="command-readiness"><span>EXEMPLO OPERACIONAL</span><strong>{format.format(ready)} <small>/ {format.format(total)}</small></strong><span>UNIDADES SIMULADAS PRONTAS</span></div>
  </div>
  <div className="command-primary">
   <TacticalMap era={era} onSelectPlanet={onSelectPlanet}/>
   <QueryDeck era={era} inventory={inventory} apiOnline={apiOnline} onNavigate={onNavigate}/>
  </div>
  <div className="command-ledger">
   <div className="ledger-toolbar"><div><span className="console-label">LOGISTICS / SELECTED ERA</span><h2>Manifesto de frota</h2></div>
    <button type="button" onClick={()=>onNavigate('fleet')}>VER INVENTÁRIO COMPLETO ↗</button></div>
   <div className="ledger-head"><span>CLASSE</span><span>POSIÇÃO</span><span>QUANTIDADE</span><span>PRONTAS</span></div>
   {priority.map(row=><div className="ledger-entry" key={row.id}>
     <strong>{shipById(row.ship)?.name}</strong><span>{planetById(row.planet)?.name}</span>
     <b>{format.format(row.quantity)}</b><b>{format.format(row.ready)}</b>
    </div>)}
   {priority.length===0&&<p className="ledger-empty">Nenhum lote cadastrado para o filtro atual. Selecione outra facção ou período.</p>}
  </div>
  <p className="command-legal">PROJETO NÃO OFICIAL DE FÃ · Estoques e coordenadas criados para testes de software; dados históricos sujeitos a contexto temporal e fontes.</p>
 </div>
}
