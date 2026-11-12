import { PLANETS, SHIPS, UNKNOWN_RECORD, planetRecord } from './galactic-registry.js'

export const normalizeName=name=>String(name||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
const ALIASES={'yavin iv':'yavin-4','mon calamari':'mon-cala','dac':'mon-cala'}

export function expandPlanetCatalog(swapi=[],era='GALACTIC_CIVIL_WAR'){
 const result=PLANETS.map(p=>({...p, ...planetRecord(p,era), documented:!!p.records.find(r=>r.era===era)}))
 const knownByName=new Set(PLANETS.map(p=>normalizeName(p.name)))
 for(const item of swapi){
  const name=String(item?.name||'').trim()
  if(!name || name.length>120 || knownByName.has(normalizeName(name)))continue
  const alias=ALIASES[normalizeName(name)]
  if(alias){
   knownByName.add(normalizeName(name))
   continue
  }
  knownByName.add(normalizeName(name))
  result.push({
   id:'swapi-'+normalizeName(name).replaceAll(' ','-'),
   name,region:'Região não classificada',
   ...UNKNOWN_RECORD,
   source:item.url||null,
   sourceType:'SWAPI',
   documented:false,
   summary:'Planeta catalogado na SWAPI, mas sem evidência suficiente de controle político nesta era.'
  })
 }
 return result
}

export function expandShipCatalog(swapi=[]){
 const result=[...SHIPS.map(ship=>({...ship,documented:true,origin:'Lucasfilm Databank'}))]
 const seen=new Set(SHIPS.map(ship=>normalizeName(ship.name)))
 for(const item of swapi){
  const name=String(item?.name||'').trim()
  if(!name || name.length>130 || seen.has(normalizeName(name)))continue
  seen.add(normalizeName(name))
  result.push({
   id:'swapi-'+normalizeName(name).replaceAll(' ','-'),name,
   faction:'UNKNOWN',era:'UNKNOWN',kind:'Nave catalogada',
   source:item.url||null,documented:false,origin:'SWAPI',
   model:typeof item.model==='string'?item.model:'Não informado'
  })
 }
 return result
}

export function fleetMetrics(rows){
 const result={total:0,ready:0,reserve:0,locations:new Set(),factions:new Set()}
 for(const row of rows){
  result.total+=row.quantity
  result.ready+=row.ready
  result.locations.add(row.planet)
  result.factions.add(row.faction)
 }
 return {...result,reserve:result.total-result.ready,locations:result.locations.size,factions:result.factions.size}
}
