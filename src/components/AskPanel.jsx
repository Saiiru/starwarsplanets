import React from 'react'
import {DEMO_INVENTORY} from '../data/galactic-registry.js'
import {answerQuestion} from '../ai/query-core.js'

const SAMPLES=[
 'Quantos X-wings estão prontos em Yavin 4?',
 'Quem controlava Coruscant nas Guerras Clônicas?',
 'Compare as frotas do Império e da Aliança',
 'Qual é a história de Mon Cala?'
]
const plain=content=>String(content||'').replace(/\*\*/g,'')
const modeLabels={'local-rules':'REGRAS / NAVEGADOR','rules':'REGRAS / BACKEND','rules-fallback':'REGRAS / FALLBACK','llm-tool':'LLM LOCAL / TOOL CALLING'}

export default function AskPanel({era,apiOnline}){
 const [question,setQuestion]=React.useState(SAMPLES[0])
 const [mode,setMode]=React.useState('rules')
 const [modelAvailable,setModelAvailable]=React.useState(false)
 const [result,setResult]=React.useState(null)
 const [busy,setBusy]=React.useState(false)
 const [error,setError]=React.useState('')
 React.useEffect(()=>{
  setResult(null);setError('')
 },[era])
 React.useEffect(()=>{
  if(!apiOnline){setModelAvailable(false);setMode('rules');return}
  const controller=new AbortController()
  fetch('/api/v1/ai/status',{signal:controller.signal}).then(r=>r.ok?r.json():null)
   .then(body=>{if(!controller.signal.aborted)setModelAvailable(body?.available===true)})
   .catch(()=>{if(!controller.signal.aborted)setModelAvailable(false)})
  return()=>controller.abort()
 },[apiOnline])

 async function ask(event){
  event?.preventDefault()
  setBusy(true);setError('');setResult(null)
  try{
   if(question.trim().length<3||question.length>500)throw Error('Pergunta deve ter 3 a 500 caracteres.')
   if(!apiOnline){
    const started=performance.now()
    const answer=answerQuestion(question,{era},{rows:DEMO_INVENTORY})
    setResult({...answer,route:'local-rules',tool:answer.intent,
      latencyMs:Math.round((performance.now()-started)*100)/100,model:null,
      guarantees:{readOnly:true,writesAllowed:false}})
   }else{
    const response=await fetch('/api/v1/ask',{method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({question,era,mode})})
    const answer=await response.json()
    if(!response.ok)throw Error(answer.message||'Erro na consulta do backend.')
    setResult(answer)
   }
  }catch(caught){setError(caught instanceof Error?caught.message:'Consulta indisponível.')}
  finally{setBusy(false)}
 }

 return <section className="ask-screen" aria-labelledby="ask-heading">
  <div className="section-heading"><span className="mono-label">07 / NATURAL LANGUAGE INTERFACE</span>
   <h2 id="ask-heading">Pergunte ao arquivo.</h2>
   <p>Uma interface experimental que transforma perguntas em consultas <strong>somente leitura</strong> ao cenário de estoque ou aos registros históricos. Sem mover naves, sem modificar contas e sem inventar fontes.</p>
  </div>
  <div className="ask-layout">
   <form className="surface ask-form" onSubmit={ask}>
    <div className="ask-topline"><span className="mono-label">QUERY CONSOLE / READ ONLY</span><span className="ask-pip">● {apiOnline?'API LOCAL':'DEMO ESTÁTICA'}</span></div>
    <label htmlFor="holonet-question">O QUE VOCÊ QUER CONSULTAR?</label>
    <textarea id="holonet-question" value={question} rows={4} maxLength={500}
      onChange={event=>setQuestion(event.target.value)}
      placeholder="Ex.: Quantos caças TIE estão operacionais em Lothal?"/>
    <div className="ask-examples"><span>PERGUNTAS PARA TESTAR</span>
     {SAMPLES.map(sample=><button type="button" key={sample} onClick={()=>{setQuestion(sample);setResult(null)}}>{sample}</button>)}
    </div>
    {apiOnline&&modelAvailable&&<fieldset className="model-select"><legend>Roteamento</legend>
     <label><input type="radio" name="routing" checked={mode==='rules'} onChange={()=>setMode('rules')}/> Regras verificáveis (rápido)</label>
     <label><input type="radio" name="routing" checked={mode==='llm'} onChange={()=>setMode('llm')}/> Modelo local (tool calling)</label>
    </fieldset>}
    <div className="ask-form-footer"><span>{question.length}/500</span>
     <button type="submit" className="ask-submit" disabled={busy}>{busy?'CONSULTANDO…':'EXECUTAR CONSULTA ↗'}</button>
    </div>
   </form>
   <div className="surface ask-guide"><p className="mono-label">OPERATIONAL GUARANTEES</p><h3>O que o sistema faz</h3>
    <ol><li><b>01</b><span>Interpreta a intenção<small>Detecta planeta, nave, era e facção</small></span></li>
     <li><b>02</b><span>Consulta a fonte adequada<small>Inventário SQL local ou lore curada com referências</small></span></li>
     <li><b>03</b><span>Responde com evidências<small>Mostra ferramenta, tempo e proveniência</small></span></li>
     <li><b>04</b><span>Recusa ações de escrita<small>Modificações exigem a UI autenticada</small></span></li></ol>
    <div className="ask-guide-foot">MODELO DESLIGADO POR PADRÃO · SEM ENVIO PARA SERVIÇOS EXTERNOS</div>
   </div>
  </div>

  {error&&<p role="alert" className="ask-error">{error}</p>}
  {result&&<article className={'answer-panel answer-'+result.status} aria-live="polite">
   <div className="answer-head"><span className="mono-label">QUERY RESULT / {result.status.toUpperCase()}</span><span>{modeLabels[result.route]||result.route}</span></div>
   <h3>{result.status==='answered'?'Consulta concluída':result.status==='blocked'?'Ação não permitida':'Evidência insuficiente'}</h3>
   <p className="answer-text">{plain(result.answer)}</p>
   {result.sources?.length>0&&<div className="answer-sources"><strong>FONTES / PROVENIÊNCIA</strong><ul>
    {result.sources.slice(0,8).map((source,index)=><li key={index}>{source.url
      ?<a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>
      :<span>{source.label}</span>}</li>)}</ul></div>}
   {result.notes?.length>0&&<p className="answer-notes">{result.notes.join(' ')}</p>}
   <div className="answer-trace"><span>FERRAMENTA: {String(result.tool||result.intent).toUpperCase()}</span>
    <span>LATÊNCIA: {Number(result.latencyMs)||0} ms</span>
    <span>ESCRITA: BLOQUEADA</span></div>
   {result.model&&<details className="model-trace"><summary>Detalhes da execução do modelo</summary>
    <p>Roteamento: {result.model.reason}. Modelo: {result.model.model||'não configurado'}. Tempo: {result.model.latencyMs} ms.</p>
    {result.model.usage&&<p>Tokens reportados pelo provedor: entrada {result.model.usage.prompt_tokens??'n/d'}, saída {result.model.usage.completion_tokens??'n/d'}.</p>}
   </details>}
  </article>}
  <p className="ask-disclaimer">As contagens são inventadas. A pesquisa histórica usa registros curados e não dispõe ainda de embeddings nem de índice vetorial. A integração de LLM é opcional, local e sujeita à capacidade do modelo.</p>
 </section>
}
