import React from 'react'
import { ERAS, FACTIONS, PLANETS, SHIPS, planetById, shipById } from '../data/galactic-registry.js'
import { fleetMetrics, normalizeName } from '../data/galactic-views.js'

const nf=value=>new Intl.NumberFormat('pt-BR').format(value)
export const factionName=id=>FACTIONS[id]?.label||'Indeterminado'
export function FactionLabel({id}){return <span className={'faction-label faction-'+(FACTIONS[id]?.tone||'unknown')}>{factionName(id)}</span>}
export function SectionHeading({code,title,description}){return <div className="section-heading"><span className="mono-label">{code}</span><h2>{title}</h2><p>{description}</p></div>}
export function StatCard({label,value,note,tone='white'}){return <div className={'stat-card stat-'+tone}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>}

export function Overview({era,faction,inventory,worlds,onNavigate}){
 const current=inventory.filter(row=>row.era===era&&(faction==='ALL'||row.faction===faction))
 const metrics=fleetMetrics(current)
 const known=worlds.filter(world=>world.control!=='UNKNOWN')
 const counts=Object.entries(FACTIONS).filter(([id])=>id!=='UNKNOWN').map(([id,data])=>({
  id,name:data.label,tone:data.tone,count:known.filter(world=>world.control===id).length
 })).filter(item=>item.count>0).sort((a,b)=>b.count-a.count)
 return <>
  <SectionHeading code="01 / FLEET STATUS" title="Situação operacional." description="Quantidades fictícias do cenário selecionado. Registros históricos e inventário nunca compartilham a mesma fonte de verdade."/>
  <div className="stats-grid">
   <StatCard label="UNIDADES NO CENÁRIO" value={nf(metrics.total)} note="Quantidades inventadas para treinamento" tone="yellow"/>
   <StatCard label="PRONTAS PARA OPERAÇÃO" value={nf(metrics.ready)} note="Disponibilidade simulada" tone="cyan"/>
   <StatCard label="EM REVISÃO / RESERVA" value={nf(metrics.reserve)} note="Unidades não prontas" tone="red"/>
   <StatCard label="MUNDOS COM CONTROLE DEFINIDO" value={nf(known.length)} note={'de '+worlds.length+' registros conhecidos'} tone="white"/>
  </div>
  <div className="overview-panels">
   <section className="surface"><p className="mono-label">TERRITORIAL STATUS</p><h3>Controle no período</h3>
    <div className="control-bars">{counts.map(item=><div className="control-bar" key={item.id}><span>{item.name}</span><div className="track"><div className={'track-fill tone-'+item.tone} style={{width:(item.count/Math.max(known.length,1)*100)+'%'}}/></div><strong>{item.count}</strong></div>)}</div>
    <p className="footnote">Número de mundos classificados nesta amostra; não representa território total de nenhuma facção.</p>
   </section>
   <section className="surface"><p className="mono-label">COMMAND PROTOCOLS</p><h3>Fontes e permissões</h3>
    <ol className="protocols"><li><b>01</b><span>Canon por época<small>Fontes históricas com status e ressalvas</small></span></li>
     <li><b>02</b><span>Frota como simulação<small>Contagem fictícia de X-wings, TIEs e outras naves</small></span></li>
     <li><b>03</b><span>Alterações auditadas<small>Autenticação local e autorização por facção</small></span></li></ol>
    <button type="button" className="link-action" onClick={()=>onNavigate('worlds')}>CONSULTAR ATLAS ↗</button>
   </section>
  </div>
  <div className="quick-grid"><button onClick={()=>onNavigate('fleet')}>INVENTÁRIO DE FROTA <span>↗</span></button>
   <button onClick={()=>onNavigate('ships')}>CLASSES DE NAVES <span>↗</span></button>
   <button onClick={()=>onNavigate('operations')}>CENTRO DE COMANDO <span>↗</span></button></div>
 </>
}

export function WorldsPanel({worlds,search,swapiCount,loading,error,era}){
 const [selected,setSelected]=React.useState(null)
 React.useEffect(()=>setSelected(null),[era])
 const results=worlds.filter(item=>normalizeName(item.name+' '+item.region+' '+item.status).includes(normalizeName(search)))
 return <>
  <SectionHeading code="02 / GALACTIC ATLAS" title="Planetas e soberania." description="Separação entre controle territorial, apoio político e ocupação. Afiliações mudam conforme a era."/>
  <div className="screen-subline"><span>{results.length} REGISTROS / {worlds.length} TOTAIS</span><span>{loading?'SINCRONIZANDO SWAPI':error?'SWAPI INDISPONÍVEL':swapiCount?swapiCount+' PLANETAS NA SWAPI':'LORE CURADA'}</span></div>
  <div className="world-grid">{results.map(item=><button key={item.id} className={'world-card '+(item.control==='UNKNOWN'?'unknown':'')} onClick={()=>setSelected(item)} aria-label={'Ver histórico de '+item.name}>
   <div className="world-top"><span>PLANET // {item.id.toUpperCase().slice(0,16)}</span><span className="status-pip" aria-hidden="true"/></div>
   <h3>{item.name}</h3><p className="world-region">{item.region}</p>
   <div className="world-data"><span>CONTROLE</span><FactionLabel id={item.control}/></div>
   <div className="world-data"><span>ALINHAMENTO</span><span>{factionName(item.alignment)}</span></div>
   <p className="world-caption">{item.status}</p><span className="read-more">VER HISTÓRICO ↗</span>
  </button>)}</div>
  {results.length===0&&<p className="empty-message">Nenhum mundo corresponde aos filtros selecionados.</p>}
  <p className="footnote">Planetas sem fontes de filiação são mantidos como INDETERMINADOS. Dados SWAPI não comprovam soberania galáctica.</p>
  {selected&&<div className="detail-backdrop" onClick={()=>setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="world-detail-title" className="detail-panel" onClick={e=>e.stopPropagation()}>
   <button type="button" className="close-detail" onClick={()=>setSelected(null)} aria-label="Fechar ficha">×</button>
   <p className="mono-label">PLANETARY RECORD / {era}</p><h2 id="world-detail-title">{selected.name}</h2>
   <p className="detail-region">{selected.region} · {selected.status}</p>
   <dl><dt>Controle territorial</dt><dd><FactionLabel id={selected.control}/></dd>
    <dt>Alinhamento político</dt><dd><FactionLabel id={selected.alignment}/></dd>
    <dt>Histórico e contexto</dt><dd>{selected.summary}</dd>
    <dt>Classificação</dt><dd>{selected.documented?'Canon · referência cadastrada':'Indeterminado · informação insuficiente para esta era'}</dd></dl>
   {selected.source&&<a href={selected.source} target="_blank" rel="noopener noreferrer">CONSULTAR FONTE ↗</a>}
   <p className="footnote">Território ocupado não equivale necessariamente a apoio político; o status pode variar dentro da era.</p>
  </section></div>}
 </>
}

export function FleetPanel({inventory,era,faction,search,backend,onNavigate}){
 const rows=inventory.filter(row=>row.era===era&&(faction==='ALL'||row.faction===faction)
  &&normalizeName((shipById(row.ship)?.name||'')+' '+(planetById(row.planet)?.name||'')).includes(normalizeName(search)))
 const totals=fleetMetrics(rows)
 return <>
  <SectionHeading code="03 / ASSET MANAGEMENT" title="Inventário de frota." description="Quantidades hipotéticas para ensinar sistemas de estoque, prontidão, transferências, permissões e auditoria."/>
  <div className="stats-grid stats-three"><StatCard label="UNIDADES SIMULADAS" value={nf(totals.total)} note="Total de unidades" tone="yellow"/>
   <StatCard label="PRONTAS" value={nf(totals.ready)} note="Disponibilidade da simulação" tone="cyan"/>
   <StatCard label="LOCAIS DE ESTOQUE" value={nf(totals.locations)} note="Mundos com inventário" tone="white"/></div>
  <div className="screen-subline"><span>STOCK LEDGER / TRAINING DATA</span><span>{backend?'BACKEND LOCAL ATIVO':'DEMO ESTÁTICA'}</span></div>
  <div className="table-region" role="region" tabIndex={0} aria-label="Tabela de estoque por nave; rolagem horizontal">
   <table><thead><tr><th>MODELO</th><th>FACÇÃO</th><th>LOCALIZAÇÃO</th><th>UNIDADES</th><th>PRONTAS</th><th>PRONTIDÃO</th></tr></thead>
    <tbody>{rows.map(row=><tr key={row.id}><td><b>{shipById(row.ship)?.name}</b><small>{shipById(row.ship)?.kind}</small></td><td><FactionLabel id={row.faction}/></td>
      <td>{planetById(row.planet)?.name}</td><td className="tab-number">{nf(row.quantity)}</td><td className="tab-number">{nf(row.ready)}</td>
      <td><span className="readiness-tag">{row.quantity?Math.round(row.ready/row.quantity*100):0}%</span></td></tr>)}</tbody>
   </table>{rows.length===0&&<p className="empty-message">Não há estoque nesta combinação de era e facção.</p>}
  </div><div className="ledger-footer"><span>QUANTIDADES FICTÍCIAS · NÃO SÃO DADOS OFICIAIS</span>
   <button className="link-action" onClick={()=>onNavigate('operations')}>GERENCIAR MOVIMENTAÇÕES ↗</button></div>
 </>
}

export function ShipsPanel({ships,search,loading,error}){
 const results=ships.filter(item=>normalizeName(item.name+' '+item.kind+' '+(item.model||'')).includes(normalizeName(search)))
 return <>
  <SectionHeading code="04 / SHIP CLASS REGISTRY" title="Classes de naves." description="Modelos identificados por fonte, sem presumir a afiliação de naves que só aparecem no catálogo da SWAPI."/>
  <div className="screen-subline"><span>{results.length} MODELOS / {ships.length} TOTAIS</span><span>{loading?'CONSULTANDO SWAPI':error?'SWAPI INDISPONÍVEL':'CATEGORIAS DISTINTAS'}</span></div>
  <div className="ships-grid">{results.map(ship=><article key={ship.id} className="ship-card">
   <div className="ship-top"><span>VESSEL / {ship.kind.toUpperCase()}</span><span>{ship.documented?'CANON':'SWAPI'}</span></div>
   <div className="ship-emblem" aria-hidden="true"><span>⌁</span><span>◊</span></div>
   <h3>{ship.name}</h3><p>{ship.kind}</p>
   <FactionLabel id={ship.faction}/>
   <div className="ship-bottom">{ship.source&&<a href={ship.source} target="_blank" rel="noopener noreferrer">REFERÊNCIA ↗</a>}
    {!ship.documented&&<small>AFILIAÇÃO NÃO VERIFICADA</small>}</div>
  </article>)}</div>
  {results.length===0&&<p className="empty-message">Nenhuma nave corresponde à busca e aos filtros.</p>}
 </>
}
