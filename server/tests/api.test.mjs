import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {buildApp} from '../src/app.js'

const adminCredentials={username:'fleet-admin',password:'correct-horse-battery-test-2026'}
async function system(options={}) {
 const service=await buildApp({...adminCredentials,bootstrapUsername:adminCredentials.username,
   bootstrapPassword:adminCredentials.password,...options})
 const request=async(method,url,payload,token)=>{
   const headers={...(token?{authorization:'Bearer '+token}:{})}
   const response=await service.app.inject({method,url,headers,payload})
   return {status:response.statusCode, body:response.json(),headers:response.headers}
 }
 const login=async(credentials=adminCredentials)=>{
   const result=await request('POST','/api/v1/auth/login',credentials)
   assert.equal(result.status,200)
   return result.body.token
 }
 return {...service,request,login}
}

test('no default/admin password and no outside credentials',async()=>{
 await assert.rejects(buildApp(),/ADMIN_USERNAME/)
 await assert.rejects(buildApp({bootstrapUsername:'root',bootstrapPassword:'short'}),/12 a 512/)
 const {app,request}=await system()
 try{
  assert.equal((await request('POST','/api/v1/auth/login',{username:'fleet-admin',password:'bad'})).status,401)
  assert.equal((await request('POST','/api/v1/transfer',{requestId:'unauthorized-0001',fromId:'inv-1',toPlanet:'corellia',quantity:1,ready:1,reason:'Sem credenciais suficientes'})).status,401)
  assert.equal((await request('GET','/api/v1/audit')).status,401)
  assert.equal((await request('GET','/api/v1/auth/me')).status,401)
 }finally{await app.close()}
})

test('planet control is era-specific and unknown is not silently guessed',async()=>{
 const {app,request}=await system()
 try{
  const clone=(await request('GET','/api/v1/planets?era=CLONE_WARS')).body
  const imperial=(await request('GET','/api/v1/planets?era=GALACTIC_CIVIL_WAR')).body
  assert.equal(clone.planets.find(p=>p.id==='coruscant').control,'REPUBLIC')
  assert.equal(imperial.planets.find(p=>p.id==='coruscant').control,'EMPIRE')
  assert.equal(imperial.planets.find(p=>p.id==='mon-cala').control,'EMPIRE')
  assert.equal(imperial.planets.find(p=>p.id==='mon-cala').alignment,'ALLIANCE')
  assert.equal(clone.planets.find(p=>p.id==='lothal').control,'UNKNOWN')
  assert.equal((await request('GET','/api/v1/planets?era=garbage')).status,400)
  assert.equal(clone.planets.find(p=>p.id==='geonosis').source.startsWith('https://www.starwars.com/'),true)
 }finally{await app.close()}
})

test('read-only catalogs clearly label synthetic fleet quantities',async()=>{
 const {app,request}=await system()
 try{
  const catalog=await request('GET','/api/v1/catalog')
  assert.equal(catalog.status,200)
  assert(catalog.body.ships.length>=14)
  const fleet=await request('GET','/api/v1/fleet?era=GALACTIC_CIVIL_WAR')
  assert.equal(fleet.body.source,'scenario-synthetic')
  assert(fleet.body.rows.some(r=>r.ship==='x-wing'))
  assert.equal(fleet.headers['cache-control'],'no-store')
 }finally{await app.close()}
})

test('operator is faction-scoped, and viewer cannot mutate or list audit',async()=>{
 const {app,request,login}=await system()
 try{
  const token=await login()
  assert.equal((await request('POST','/api/v1/users',{username:'operator-imperial',password:'long-passphrase-12345',role:'operator',factionScope:'EMPIRE'},token)).status,201)
  assert.equal((await request('POST','/api/v1/users',{username:'observer',password:'long-passphrase-12345',role:'viewer'},token)).status,201)
  const operator=await login({username:'operator-imperial',password:'long-passphrase-12345'})
  const viewer=await login({username:'observer',password:'long-passphrase-12345'})
  const transfer={requestId:'transfer-no-rights-001',fromId:'inv-4',toPlanet:'mon-cala',quantity:2,ready:2,reason:'Roteamento logístico fictício'}
  assert.equal((await request('POST','/api/v1/transfer',transfer,operator)).status,403)
  assert.equal((await request('POST','/api/v1/transfer',{...transfer,fromId:'inv-1'},viewer)).status,403)
  assert.equal((await request('POST','/api/v1/inventory/adjust',{id:'inv-1',delta:5,readyDelta:5,reason:'Ajuste permitido somente ao comando'},operator)).status,403)
  assert.equal((await request('GET','/api/v1/audit',null,operator)).status,403)
  assert.equal((await request('GET','/api/v1/users',null,viewer)).status,403)
 }finally{await app.close()}
})

test('transfer remains balanced; retries are idempotent and conflicting replay rejected',async()=>{
 const {app,request,login}=await system()
 try{
  const token=await login()
  const before=(await request('GET','/api/v1/fleet')).body.rows
  const input={requestId:'transfer-balanced-001',fromId:'inv-1',toPlanet:'corellia',quantity:6,ready:4,reason:'Reposicionamento de cenário fictício'}
  const first=await request('POST','/api/v1/transfer',input,token)
  assert.equal(first.status,201,JSON.stringify(first.body))
  assert.equal(first.body.replayed,false)
  const replay=await request('POST','/api/v1/transfer',input,token)
  assert.equal(replay.status,200)
  assert.equal(replay.body.replayed,true)
  assert.equal((await request('POST','/api/v1/transfer',{...input,quantity:8},token)).status,409)
  const after=(await request('GET','/api/v1/fleet')).body.rows
  assert.equal(after.find(x=>x.id==='inv-1').quantity,42)
  assert.equal(after.find(x=>x.id==='inv-1').ready,33)
  const destination=after.find(x=>x.planet==='corellia'&&x.ship==='tie-ln')
  assert.equal(destination.quantity,6)
  assert.equal(destination.ready,4)
  assert.equal(after.reduce((a,b)=>a+b.quantity,0),before.reduce((a,b)=>a+b.quantity,0))
  assert.equal((await request('GET','/api/v1/movements',null,token)).body.movements.length,1)
  assert.equal((await request('GET','/api/v1/audit',null,token)).body.events.filter(e=>e.action==='TRANSFER').length,1)
 }finally{await app.close()}
})

test('cannot transfer insufficient stock, overdraw ready units or invent a planet',async()=>{
 const {app,request,login}=await system()
 try{
  const token=await login()
  const common={requestId:'transfer-rejected-001',fromId:'inv-1',toPlanet:'corellia',quantity:4000,ready:1,reason:'Tentativa de validação, não alterar'}
  assert.equal((await request('POST','/api/v1/transfer',common,token)).status,409)
  assert.equal((await request('POST','/api/v1/transfer',{...common,quantity:2,ready:3},token)).status,400)
  assert.equal((await request('POST','/api/v1/transfer',{...common,toPlanet:'fake-planet',quantity:1,ready:1},token)).status,400)
  assert.equal((await request('POST','/api/v1/transfer',{...common,toPlanet:'lothal',quantity:1,ready:1},token)).status,400)
  const after=(await request('GET','/api/v1/fleet')).body.rows
  assert.equal(after.find(x=>x.id==='inv-1').quantity,48)
 }finally{await app.close()}
})

test('adjust inventory restricted to admin and validated with audit',async()=>{
 const {app,request,login}=await system()
 try{
  const token=await login()
  const base={id:'inv-4',delta:-2,readyDelta:-2,reason:'Dano registrado em cenário fictício'}
  assert.equal((await request('POST','/api/v1/inventory/adjust',base,token)).status,200)
  assert.equal((await request('POST','/api/v1/inventory/adjust',{...base,delta:-9999},token)).status,409)
  assert.equal((await request('GET','/api/v1/fleet')).body.rows.find(r=>r.id==='inv-4').quantity,34)
  assert((await request('GET','/api/v1/audit',null,token)).body.events.some(e=>e.action==='ADJUST'))
 }finally{await app.close()}
})

test('session logout revokes token and no stored session credentials in response',async()=>{
 const {app,request,login}=await system()
 try{
  const token=await login()
  const profile=await request('GET','/api/v1/auth/me',null,token)
  assert.equal(profile.status,200)
  assert(!JSON.stringify(profile.body).includes('password'))
  assert.equal((await request('POST','/api/v1/auth/logout',{},token)).status,200)
  assert.equal((await request('GET','/api/v1/auth/me',null,token)).status,401)
 }finally{await app.close()}
})

test('SQLite persists users, fleet movements and audit across restarts',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'holonet-registry-'))
 const dbPath=join(dir,'fleet.db')
 try{
  const first=await system({dbPath})
  const token=await first.login()
  const outcome=await first.request('POST','/api/v1/transfer',{
    requestId:'restart-replay-001',fromId:'inv-4',toPlanet:'mon-cala',quantity:3,ready:2,
    reason:'Transferência fictícia com teste de persistência'
  },token)
  assert.equal(outcome.status,201)
  await first.app.close()
  const second=await system({dbPath,bootstrapPassword:'irrelevant-not-overwritten'})
  const login2=await second.login()
  assert.equal((await second.request('GET','/api/v1/fleet')).body.rows.find(r=>r.id==='inv-4').quantity,33)
  assert.equal((await second.request('GET','/api/v1/audit',null,login2)).body.events.length,1)
  await second.app.close()
 }finally{rmSync(dir,{recursive:true,force:true})}
})
