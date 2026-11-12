import React from 'react'
import {connect} from 'react-redux'
import CardList from './components/CardList'
import SearchBox from './components/SearchBox'
import Operations from './components/Operations'
import AskPanel from './components/AskPanel'
import {Overview, WorldsPanel, FleetPanel, ShipsPanel} from './components/GalacticPanels'
import {setSearchField,requestPlanets} from './redux/action'
import {apiCall,swapiUrl} from './api/api.js'
import {ERAS,FACTIONS,DEMO_INVENTORY} from './data/galactic-registry.js'
import {expandPlanetCatalog,expandShipCatalog,normalizeName} from './data/galactic-views.js'

const NAV=[
 {id:'command',label:'VISÃO GERAL',no:'01'},
 {id:'worlds',label:'ATLAS GALÁCTICO',no:'02'},
 {id:'fleet',label:'INVENTÁRIO',no:'03'},
 {id:'ships',label:'CLASSES DE NAVES',no:'04'},
 {id:'operations',label:'COMANDO SEGURO',no:'05'},
 {id:'archive',label:'SWAPI ORIGINAL',no:'06'},
 {id:'ask',label:'CONSULTA NATURAL',no:'07'}
]
const fromHash=()=>NAV.find(item=>item.id===location.hash.slice(1))?.id||'command'
const isLocalHost=()=>location.hostname==='localhost'||location.hostname==='127.0.0.1'

function FleetRegistry({searchField,onSearchChange,onRequestPlanets,planets,isPending,error}){
 const [tab,setTab]=React.useState(fromHash)
 const [era,setEra]=React.useState('GALACTIC_CIVIL_WAR')
 const [faction,setFaction]=React.useState('ALL')
 const [search,setSearch]=React.useState('')
 const [swapiShips,setSwapiShips]=React.useState([])
 const [shipLoading,setShipLoading]=React.useState(false)
 const [shipError,setShipError]=React.useState(false)
 const [backend,setBackend]=React.useState(false)
 const [inventory,setInventory]=React.useState(DEMO_INVENTORY)
 const [token,setToken]=React.useState(null)
 const [user,setUser]=React.useState(null)
 const askedPlanets=React.useRef(false)
 const askedShips=React.useRef(false)
 const choose=id=>{
  history.replaceState(null,'','#'+id)
  setTab(id);setSearch('')
  window.scrollTo(0,0)
 }
 React.useEffect(()=>{
  const changed=()=>setTab(fromHash())
  window.addEventListener('hashchange',changed)
  return()=>window.removeEventListener('hashchange',changed)
 },[])
 React.useEffect(()=>{
  if((tab==='worlds'||tab==='archive')&&!askedPlanets.current){
   askedPlanets.current=true;onRequestPlanets()
  }
 },[tab,onRequestPlanets])
 React.useEffect(()=>{
  if(tab!=='ships'||askedShips.current)return
  askedShips.current=true;setShipLoading(true)
  apiCall(swapiUrl('starships'))
   .then(result=>{setSwapiShips(result.results);setShipError(false)})
   .catch(()=>setShipError(true)).finally(()=>setShipLoading(false))
 },[tab])
 const refreshInventory=React.useCallback(async()=>{
  if(!backend){setInventory(DEMO_INVENTORY);return}
  try{
   const response=await fetch('/api/v1/fleet')
   if(!response.ok)throw Error('Backend indisponível')
   const body=await response.json()
   if(body.source==='scenario-synthetic')setInventory(body.rows)
  }catch{setBackend(false);setInventory(DEMO_INVENTORY)}
 },[backend])
 React.useEffect(()=>{
  if(!isLocalHost())return
  const controller=new AbortController()
  fetch('/api/v1/health',{signal:controller.signal})
   .then(response=>response.ok?response.json():null)
   .then(body=>{if(!controller.signal.aborted)setBackend(body?.status==='ok')})
   .catch(()=>{if(!controller.signal.aborted)setBackend(false)})
  return()=>controller.abort()
 },[])
 React.useEffect(()=>{refreshInventory()},[refreshInventory])

 const worlds=React.useMemo(()=>expandPlanetCatalog(planets,era),[planets,era])
 const worldsFiltered=React.useMemo(()=>worlds.filter(world=>faction==='ALL'||world.control===faction||world.alignment===faction),[worlds,faction])
 const catalog=React.useMemo(()=>expandShipCatalog(swapiShips),[swapiShips])
 const ships=React.useMemo(()=>catalog.filter(ship=>(ship.era===era||ship.era==='UNKNOWN')&&(faction==='ALL'||ship.faction===faction)),[catalog,era,faction])
 const filteredArchive=planets.filter(planet=>normalizeName(planet.name).includes(normalizeName(searchField)))

 return <div className="holo-app">
  <a href="#main-content" className="skip-nav">Pular para o conteúdo</a>
  <header className="topbar">
   <a href="#command" className="logo" onClick={event=>{event.preventDefault();choose('command')}} aria-label="HOLO-NET Fleet Registry - início">
    <span className="logo-glyph" aria-hidden="true">◈</span><span><strong>HOLO<span>NET</span></strong><small>FLEET REGISTRY // SYSTEM 01</small></span>
   </a>
   <div className="topbar-meta"><span className="uptime"><i aria-hidden="true"/>OPEN DEMO / READ ONLY</span>
    <a href="https://github.com/Saiiru/starwarsplanets" target="_blank" rel="noopener noreferrer">SOURCE CODE ↗</a></div>
  </header>
  <div className="app-shell">
   <aside className="sidebar">
    <div className="nav-label">SYSTEM NAVIGATION <span>●</span></div>
    <nav aria-label="Navegação principal" className="nav-stack">
     {NAV.map(item=><button key={item.id} className={'nav-button '+(tab===item.id?'selected':'')} type="button" aria-current={tab===item.id?'page':undefined}
       onClick={()=>choose(item.id)}><span>{item.no}</span><b>{item.label}</b><em aria-hidden="true">↗</em></button>)}
    </nav>
    <div className="sidebar-foot"><span>DATA SOURCES</span><p>LUCASFILM DATABANK</p><p>SWAPI / EXTERNAL CATALOG</p><p>SIMULATED FLEET SCENARIO</p><small>FAN-MADE / EDUCATIONAL PROJECT</small></div>
   </aside>
   <main id="main-content" className="main">
    <div className="topline"><span>GALACTIC OPERATIONS / RESEARCH INSTANCE</span><span>ACCESS // PUBLIC DATASET</span></div>
    <div className="hero">
     <p className="eyebrow">// FLEET INTELLIGENCE · ASSET REGISTRY · LORE ARCHIVE</p>
     <h1>FLEET <span>CONTROL.</span></h1>
     <p>Logística ficcional com rastreabilidade: planetas e filiações por época, classes de naves e um inventário de treinamento inspirado nos comandos da República e do Império.</p>
    </div>
    <div className="control-strip">
     <label>ERA GALÁCTICA<select value={era} onChange={event=>{setEra(event.target.value);setSearch('')}}>{ERAS.map(item=><option key={item.id} value={item.id}>{item.label} · {item.dating}</option>)}</select></label>
     <label>FACÇÃO<select value={faction} onChange={event=>setFaction(event.target.value)}><option value="ALL">Todas as facções</option>{Object.entries(FACTIONS).filter(([id])=>id!=='UNKNOWN').map(([id,value])=><option key={id} value={id}>{value.label}</option>)}</select></label>
     {['worlds','fleet','ships'].includes(tab)&&<label className="query-input">PESQUISA<input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar planeta, nave…"/></label>}
     <span className="era-marker">{ERAS.find(item=>item.id===era)?.dating}</span>
    </div>
    {tab==='command'&&<button type='button' className='ask-entry' onClick={()=>choose('ask')}>CONSULTAR EM LINGUAGEM NATURAL <span>↗</span></button>}
    <div className="disclosure" role="note"><strong>SIMULAÇÃO DE TREINAMENTO</strong><span>Quantidades de estoque são inventadas. Registros históricos citam fontes e nunca presumem facção quando há lacunas.</span></div>

    {tab==='command'&&<Overview era={era} faction={faction} inventory={inventory} worlds={worldsFiltered} onNavigate={choose}/>}
    {tab==='worlds'&&<WorldsPanel era={era} worlds={worldsFiltered} search={search} swapiCount={planets.length} loading={isPending} error={error}/>}
    {tab==='fleet'&&<FleetPanel era={era} faction={faction} search={search} inventory={inventory} backend={backend} onNavigate={choose}/>}
    {tab==='ships'&&<ShipsPanel ships={ships} search={search} loading={shipLoading} error={shipError}/>}
    {tab==='ask'&&<AskPanel era={era} apiOnline={backend}/>}
    {tab==='operations'&&<Operations apiOnline={backend} token={token} setToken={setToken} user={user} setUser={setUser} inventory={inventory} refreshInventory={refreshInventory}/>}
    {tab==='archive'&&<section className="archive-module">
     <header className="section-heading"><span className="mono-label">06 / ORIGINAL SWAPI LAB</span><h2>Planet Explorer.</h2><p>Implementação original React/Redux preservada. O catálogo SWAPI não registra controle territorial.</p></header>
     <SearchBox onSearchChange={onSearchChange} searchField={searchField}/>
     {isPending&&<p role="status">Carregando planetas…</p>}
     {error&&<div role="alert"><p>A SWAPI respondeu com erro: {error}</p><button type="button" onClick={onRequestPlanets}>Tentar novamente</button></div>}
     {!isPending&&!error&&<p role="status">{filteredArchive.length} de {planets.length} planetas encontrados.</p>}
     <CardList planets={filteredArchive}/>
    </section>}
    <footer className="main-footer"><span>HOLO-NET FLEET REGISTRY / NON-COMMERCIAL PORTFOLIO LAB</span><span>CANON: SOURCE LINKS · INVENTORY: SIMULATED</span></footer>
   </main>
  </div>
 </div>
}
const mapStateToProps=state=>({searchField:state.searchPlanets.searchField,
 planets:state.requestPlanets.planets,isPending:state.requestPlanets.isPending,error:state.requestPlanets.error})
const mapDispatchToProps=dispatch=>({
 onSearchChange:event=>dispatch(setSearchField(event.target.value)),
 onRequestPlanets:()=>dispatch(requestPlanets())
})
export default connect(mapStateToProps,mapDispatchToProps)(FleetRegistry)
