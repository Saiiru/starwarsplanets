import test from 'node:test'
import assert from 'node:assert/strict'
import {ERAS,FACTIONS,PLANETS,SHIPS,DEMO_INVENTORY,planetRecord} from '../src/data/galactic-registry.js'
import {expandPlanetCatalog,expandShipCatalog,fleetMetrics} from '../src/data/galactic-views.js'

test('every curated world is sourced by era and never has invented fixed affiliation',()=>{
 const eraIds=new Set(ERAS.map(era=>era.id))
 assert.equal(PLANETS.length,12)
 const ids=new Set()
 for(const planet of PLANETS){
  assert(!ids.has(planet.id));ids.add(planet.id)
  for(const record of planet.records){
   assert(eraIds.has(record.era))
   assert(FACTIONS[record.control]&&FACTIONS[record.alignment])
   assert(record.source?.startsWith('https://www.starwars.com/databank/'))
   assert.equal(record.canon,'Canon')
   assert(record.summary.length>=35)
  }
 }
 assert.equal(planetRecord(PLANETS.find(p=>p.id==='coruscant'),'CLONE_WARS').control,'REPUBLIC')
 assert.equal(planetRecord(PLANETS.find(p=>p.id==='coruscant'),'GALACTIC_CIVIL_WAR').control,'EMPIRE')
 assert.equal(planetRecord(PLANETS.find(p=>p.id==='mon-cala'),'GALACTIC_CIVIL_WAR').alignment,'ALLIANCE')
 assert.equal(planetRecord(PLANETS.find(p=>p.id==='mandalore'),'CLONE_WARS').alignment,'NEUTRAL')
 assert.equal(planetRecord(PLANETS.find(p=>p.id==='lothal'),'CLONE_WARS').control,'UNKNOWN')
})

test('a SWAPI-only planet keeps affiliation UNKNOWN and duplicates are merged',()=>{
 const swapi=[
  {name:'Coruscant',url:'https://swapi.dev/api/planets/9/'},
  {name:'Yavin IV',url:'https://swapi.dev/api/planets/3/'},
  {name:'Dagobah',url:'https://swapi.dev/api/planets/5/'}
 ]
 const worlds=expandPlanetCatalog(swapi,'GALACTIC_CIVIL_WAR')
 assert.equal(worlds.filter(p=>p.name==='Coruscant').length,1)
 assert.equal(worlds.filter(p=>p.name==='Yavin 4').length,1)
 const unknown=worlds.find(p=>p.name==='Dagobah')
 assert(unknown)
 assert.equal(unknown.control,'UNKNOWN')
 assert.equal(unknown.alignment,'UNKNOWN')
 assert.equal(unknown.documented,false)
 assert.equal(unknown.sourceType,'SWAPI')
})

test('models with no verified affiliation never inherit a faction from a fleet fixture',()=>{
 assert.equal(SHIPS.length,14)
 for(const ship of SHIPS) {
  assert(FACTIONS[ship.faction])
  assert(ERAS.some(e=>e.id===ship.era))
  assert(ship.source.startsWith('https://www.starwars.com/databank/'))
 }
 const expanded=expandShipCatalog([{name:'Custom Star Cruiser',model:'Civilian',url:'https://swapi.dev/api/starships/99/'},
   {name:'TIE/ln Fighter',url:'https://swapi.dev/api/starships/100/'}])
 assert.equal(expanded.length,SHIPS.length+1)
 assert.equal(expanded.at(-1).faction,'UNKNOWN')
})

test('scenario inventory quantities and readiness are independent fictional values',()=>{
 const eras=new Set(ERAS.map(e=>e.id)), shipIds=new Set(SHIPS.map(s=>s.id))
 const worlds=new Set(PLANETS.map(p=>p.id))
 const ids=new Set()
 for(const row of DEMO_INVENTORY){
  assert(!ids.has(row.id));ids.add(row.id)
  assert(eras.has(row.era)&&shipIds.has(row.ship)&&worlds.has(row.planet)&&FACTIONS[row.faction])
  assert(Number.isSafeInteger(row.quantity)&&row.quantity>=0)
  assert(Number.isSafeInteger(row.ready)&&row.ready>=0&&row.ready<=row.quantity)
  const ship=SHIPS.find(s=>s.id===row.ship)
  assert.equal(ship.era,row.era)
  assert.equal(ship.faction,row.faction)
 }
 const all=fleetMetrics(DEMO_INVENTORY)
 assert.equal(all.total,423)
 assert.equal(all.ready,338)
 assert.equal(all.reserve,85)
 const clone=fleetMetrics(DEMO_INVENTORY.filter(r=>r.era==='CLONE_WARS'))
 const civil=fleetMetrics(DEMO_INVENTORY.filter(r=>r.era==='GALACTIC_CIVIL_WAR'))
 assert.equal(clone.total+civil.total,all.total)
})
