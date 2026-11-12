import React from 'react'
import { PLANETS, FACTIONS, shipById, planetById } from '../data/galactic-registry.js'

async function callApi(path,{token,body,method='GET'}={}){
 const response=await fetch('/api/v1/'+path,{
  method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},
  ...(body?{body:JSON.stringify(body)}:{})
 })
 const result=await response.json()
 if(!response.ok)throw Error(result.message||'Falha HTTP '+response.status)
 return result
}
const initialMove={fromId:'',toPlanet:'',quantity:'1',ready:'1',reason:''}

export default function Operations({apiOnline,token,setToken,user,setUser,inventory,refreshInventory}){
 const [username,setUsername]=React.useState('')
 const [password,setPassword]=React.useState('')
 const [busy,setBusy]=React.useState(false)
 const [error,setError]=React.useState('')
 const [notice,setNotice]=React.useState('')
 const [movement,setMovement]=React.useState(initialMove)
 const [movementId,setMovementId]=React.useState('')
 const [history,setHistory]=React.useState([])
 const [invite,setInvite]=React.useState({username:'',password:'',role:'viewer',factionScope:'EMPIRE'})

 React.useEffect(()=>{
  if(!token){setHistory([]);return}
  callApi('movements',{token}).then(response=>setHistory(response.movements)).catch(()=>setHistory([]))
 },[token])

 async function login(event){
  event.preventDefault();setError('');setNotice('');setBusy(true)
  try{
   const response=await callApi('auth/login',{method:'POST',body:{username,password}})
   setToken(response.token);setUser(response.user);setPassword('')
   setNotice('Sessão de comando ativa até expirar ou ser encerrada.')
  }catch(err){setError(err.message)}
  finally{setBusy(false)}
 }
 async function logout(){
  try{if(token)await callApi('auth/logout',{token,method:'POST',body:{}})}catch{}
  setToken(null);setUser(null);setHistory([]);setMovement(initialMove);setNotice('Sessão encerrada.')
 }
 const eligible=inventory.filter(row=>user&&(user.role==='admin'||(user.role==='operator'&&user.factionScope===row.faction)))
 const canMove=user&&(user.role==='admin'||user.role==='operator')
 function editMovement(field,value){
  setMovement(old=>({...old,[field]:value}));setMovementId('');setError('')
 }
 async function transfer(event){
  event.preventDefault();setBusy(true);setError('');setNotice('')
  try{
   const from=eligible.find(r=>r.id===movement.fromId)
   if(!from)throw Error('Selecione um estoque permitido.')
   const quantity=Number(movement.quantity),ready=Number(movement.ready)
   if(!Number.isSafeInteger(quantity)||quantity<1||!Number.isSafeInteger(ready)||ready<0||ready>quantity)throw Error('Quantidade e prontidão inválidas.')
   const requestId=movementId||crypto.randomUUID()
   setMovementId(requestId)
   const response=await callApi('transfer',{token,method:'POST',body:{
    requestId,fromId:from.id,toPlanet:movement.toPlanet,quantity,ready,reason:movement.reason
   }})
   setNotice(response.replayed?'Solicitação repetida identificada; estoque não foi debitado novamente.':'Movimentação registrada e auditada no backend.')
   setMovement(initialMove);setMovementId('')
   await refreshInventory()
   const events=await callApi('movements',{token});setHistory(events.movements)
  }catch(err){setError(err.message)}
  finally{setBusy(false)}
 }
 async function addUser(event){
  event.preventDefault();setBusy(true);setError('');setNotice('')
  try{
   const values={...invite,factionScope:invite.role==='operator'?invite.factionScope:null}
   await callApi('users',{token,method:'POST',body:values})
   setInvite({username:'',password:'',role:'viewer',factionScope:'EMPIRE'})
   setNotice('Usuário criado no banco local; nenhuma credencial foi publicada.')
  }catch(err){setError(err.message)}
  finally{setBusy(false)}
 }

 return <section className="ops-screen" aria-labelledby="ops-title">
  <div className="screen-head">
   <div><p className="micro">SECURE ACCESS / LOCAL NETWORK</p><h2 id="ops-title">Centro de operações</h2></div>
   <span className={'chip '+(apiOnline?'chip-online':'chip-offline')}>{apiOnline?'API LOCAL ATIVA':'DEMONSTRAÇÃO PÚBLICA'}</span>
  </div>
  <p className="screen-intro">O inventário público é fictício e somente leitura. Transferências, usuários e trilha de auditoria exigem o backend local autenticado. Nenhuma senha de demonstração é publicada.</p>
  {!apiOnline&&<div className="ops-offline">
   <span className="ops-offline-icon" aria-hidden="true">◇</span>
   <h3>Backend não conectado</h3>
   <p>Esta versão pública no GitHub Pages exibe apenas o cenário. Execute a API local e o Vite com proxy para administrar movimentações. Consulte <a href="https://github.com/Saiiru/starwarsplanets/blob/main/docs/FLEET_OPERATIONS.md" target="_blank" rel="noreferrer">o guia de arquitetura e testes</a>.</p>
   <code>cd server && npm ci && npm start</code>
  </div>}
  {apiOnline&&!token&&<form className="ops-auth-form panel" onSubmit={login}>
   <h3>Autenticação de oficial</h3>
   <p>Crie a conta administrativa inicial usando variáveis de ambiente. A sessão fica somente na memória da aba.</p>
   <label>Identificação<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required/></label>
   <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
   <button className="action-primary" type="submit" disabled={busy}>ENTRAR NO COMANDO</button>
  </form>}
  {apiOnline&&token&&user&&<>
   <div className="ops-userbar panel"><div><strong>{user.username}</strong><p>Perfil: {user.role} · Escopo: {user.factionScope?FACTIONS[user.factionScope]?.label:'todas as facções'}</p></div><button type="button" onClick={logout}>Encerrar sessão</button></div>
   {canMove&&<form className="ops-move panel" onSubmit={transfer}>
    <div><p className="micro">FLEET MOVEMENT / AUDITABLE</p><h3>Transferir unidades</h3></div>
    <div className="form-grid">
     <label>Origem / modelo
      <select required value={movement.fromId} onChange={e=>editMovement('fromId',e.target.value)}>
       <option value="">Selecionar estoque</option>
       {eligible.map(row=><option key={row.id} value={row.id}>{FACTIONS[row.faction]?.label} · {planetById(row.planet)?.name} · {shipById(row.ship)?.name} ({row.quantity})</option>)}
      </select>
     </label>
     <label>Destino
      <select required value={movement.toPlanet} onChange={e=>editMovement('toPlanet',e.target.value)}>
       <option value="">Selecionar planeta</option>
       {PLANETS.filter(planet=>planet.id!==eligible.find(r=>r.id===movement.fromId)?.planet)
         .map(planet=><option key={planet.id} value={planet.id}>{planet.name}</option>)}
      </select>
     </label>
     <label>Unidades<input required type="number" min="1" max="100000" step="1" value={movement.quantity} onChange={e=>editMovement('quantity',e.target.value)}/></label>
     <label>Prontas para operação<input required type="number" min="0" max="100000" step="1" value={movement.ready} onChange={e=>editMovement('ready',e.target.value)}/></label>
    </div>
    <label>Justificativa auditável<textarea required minLength={8} maxLength={400} rows={3} value={movement.reason} onChange={e=>editMovement('reason',e.target.value)} placeholder="Ex.: Reposicionamento fictício para treinamento de logística"/></label>
    <button className="action-primary" type="submit" disabled={busy}>CONFIRMAR TRANSFERÊNCIA</button>
   </form>}
   {user.role==='admin'&&<details className="panel ops-admin">
    <summary>Administração de operadores e permissões</summary>
    <form onSubmit={addUser} className="form-grid">
     <label>Novo usuário<input required value={invite.username} onChange={e=>setInvite(old=>({...old,username:e.target.value}))} minLength={3}/></label>
     <label>Senha inicial segura<input required type="password" autoComplete="new-password" minLength={12} value={invite.password} onChange={e=>setInvite(old=>({...old,password:e.target.value}))}/></label>
     <label>Função<select value={invite.role} onChange={e=>setInvite(old=>({...old,role:e.target.value}))}><option value="viewer">Viewer</option><option value="operator">Operator</option><option value="admin">Admin</option></select></label>
     {invite.role==='operator'&&<label>Facção autorizada<select value={invite.factionScope} onChange={e=>setInvite(old=>({...old,factionScope:e.target.value}))}>{['EMPIRE','ALLIANCE','REPUBLIC','CIS'].map(id=><option key={id} value={id}>{FACTIONS[id].label}</option>)}</select></label>}
     <button type="submit" disabled={busy}>CRIAR USUÁRIO LOCAL</button>
    </form>
   </details>}
   <div className="panel ops-events"><h3>Últimas movimentações</h3>{history.length===0?<p>Nenhuma movimentação registrada.</p>:<ul>{history.slice(0,12).map(e=><li key={e.id}><span>{planetById(e.from_planet)?.name} → {planetById(e.to_planet)?.name}</span><strong>{e.quantity} × {shipById(e.ship)?.name}</strong><small>{e.reason}</small></li>)}</ul>}</div>
  </>}
  {error&&<p role="alert" className="ops-error">{error}</p>}
  {notice&&<p role="status" className="ops-notice">{notice}</p>}
 </section>
}
