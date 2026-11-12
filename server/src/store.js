import Database from 'better-sqlite3'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto'
import { DEMO_INVENTORY, PLANETS, SHIPS, ERAS } from '../../src/data/galactic-registry.js'

export const ROLES = Object.freeze(['admin', 'operator', 'viewer'])
export const FACTION_SCOPE = Object.freeze(['REPUBLIC', 'CIS', 'EMPIRE', 'ALLIANCE'])
const tokenDigest = token => createHash('sha256').update(token).digest('hex')
const isoTime = () => new Date().toISOString()
const positive = value => Number.isSafeInteger(value) && value > 0
const nonNegative = value => Number.isSafeInteger(value) && value >= 0
const reasonValid = value => typeof value === 'string' && value.trim().length >= 8 && value.trim().length <= 400

function passwordHash(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 512) throw Error('A senha deve conter de 12 a 512 caracteres.')
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  return 'scrypt$' + salt.toString('hex') + '$' + hash.toString('hex')
}
function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 512) return false
  const [algorithm, saltHex, hashHex] = stored.split('$')
  if (algorithm !== 'scrypt') return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), 64)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export function createStore({ dbPath = ':memory:', bootstrapUsername, bootstrapPassword } = {}) {
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','operator','viewer')),
      faction_scope TEXT CHECK (faction_scope IN ('REPUBLIC','CIS','EMPIRE','ALLIANCE') OR faction_scope IS NULL),
      disabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY, era TEXT NOT NULL, faction TEXT NOT NULL, planet TEXT NOT NULL,
      ship TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity >= 0),
      ready INTEGER NOT NULL CHECK(ready >= 0 AND ready <= quantity),
      UNIQUE(era,faction,planet,ship)
    );
    CREATE TABLE IF NOT EXISTS movements (
      id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE, era TEXT NOT NULL, faction TEXT NOT NULL,
      ship TEXT NOT NULL, from_planet TEXT NOT NULL, to_planet TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0), ready INTEGER NOT NULL CHECK(ready >= 0),
      reason TEXT NOT NULL, payload_hash TEXT NOT NULL, actor_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit (
      id TEXT PRIMARY KEY, actor_id TEXT REFERENCES users(id),
      action TEXT NOT NULL, object_type TEXT NOT NULL, object_id TEXT NOT NULL,
      details TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS ix_inventory_lookup ON inventory(era,faction,planet);
    CREATE INDEX IF NOT EXISTS ix_audit_time ON audit(created_at DESC);
  `)

  const userCount = db.prepare('SELECT COUNT(*) AS total FROM users').get().total
  if (userCount === 0 && (!bootstrapUsername || !bootstrapPassword)) {
    db.close()
    throw new Error('Primeiro início requer ADMIN_USERNAME e ADMIN_PASSWORD (12+ caracteres), via ambiente. Não existe conta padrão.')
  }
  if (userCount === 0) {
    db.prepare('INSERT INTO users(id,username,password_hash,role,faction_scope,created_at) VALUES(?,?,?,?,?,?)')
      .run(randomUUID(), bootstrapUsername, passwordHash(bootstrapPassword), 'admin', null, isoTime())
  }
  const seeded = db.prepare('SELECT COUNT(*) AS total FROM inventory').get().total
  if (seeded === 0) {
    const insert = db.prepare('INSERT INTO inventory(id,era,faction,planet,ship,quantity,ready) VALUES(@id,@era,@faction,@planet,@ship,@quantity,@ready)')
    db.transaction(() => { for (const fixture of DEMO_INVENTORY) insert.run(fixture) })()
  }

  function findUser(token) {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null
    const row = db.prepare(`SELECT users.id,users.username,users.role,users.faction_scope
      FROM sessions JOIN users ON sessions.user_id=users.id
      WHERE sessions.token_hash=? AND sessions.expires_at>? AND users.disabled=0`)
      .get(tokenDigest(token), Date.now())
    return row || null
  }

  function login(username, password) {
    // No default demo account. Do not reveal whether username exists.
    const user = typeof username === 'string' && username.length <= 80
      ? db.prepare('SELECT * FROM users WHERE username=? AND disabled=0').get(username)
      : null
    if (!user || !verifyPassword(password, user.password_hash)) return null
    const token = randomBytes(32).toString('hex')
    db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)')
      .run(tokenDigest(token), user.id, Date.now() + 12 * 60 * 60 * 1000)
    return { token, expiresAt: Date.now() + 12 * 60 * 60 * 1000, user:publicUser(user) }
  }
  function logout(token) {
    if (typeof token === 'string' && /^[a-f0-9]{64}$/.test(token)) {
      db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenDigest(token))
    }
  }
  function publicUser(user) {
    return {id:user.id, username:user.username, role:user.role, factionScope:user.faction_scope}
  }
  function authCanWrite(user,faction) {
    return user && (user.role === 'admin' || (user.role === 'operator' && user.faction_scope === faction))
  }
  function inventory(era) {
    const sql = 'SELECT id,era,faction,planet,ship,quantity,ready FROM inventory'
    return era ? db.prepare(sql+' WHERE era=? ORDER BY faction,planet,ship').all(era)
      : db.prepare(sql+' ORDER BY era,faction,planet,ship').all()
  }
  function appendAudit(actor, action, objectType, objectId, details) {
    db.prepare('INSERT INTO audit(id,actor_id,action,object_type,object_id,details,created_at) VALUES(?,?,?,?,?,?,?)')
      .run(randomUUID(),actor,action,objectType,objectId,JSON.stringify(details),isoTime())
  }
  function createUser(actor, {username,password,role,factionScope=null}) {
    if (actor.role !== 'admin') return {error:'forbidden'}
    if (typeof username !== 'string' || !/^[a-zA-Z0-9_.-]{3,40}$/.test(username) || !ROLES.includes(role)
      || (role === 'operator' && !FACTION_SCOPE.includes(factionScope))
      || (role !== 'operator' && factionScope !== null)) return {error:'invalid'}
    const id = randomUUID()
    try {
      db.transaction(() => {
        db.prepare('INSERT INTO users(id,username,password_hash,role,faction_scope,created_at) VALUES(?,?,?,?,?,?)')
          .run(id,username,passwordHash(password),role,factionScope,isoTime())
        appendAudit(actor.id,'USER_CREATE','user',id,{username,role,factionScope})
      })()
    } catch (error) {
      if (error.code?.startsWith('SQLITE_CONSTRAINT_UNIQUE')) return {error:'duplicate'}
      throw error
    }
    return {user:{id,username,role,factionScope}}
  }

  const executeTransfer = db.transaction(({user,requestId,fromId,toPlanet,quantity,ready,reason}) => {
    const fingerprint=tokenDigest(JSON.stringify({fromId,toPlanet,quantity,ready,reason}))
    const previous = db.prepare('SELECT * FROM movements WHERE request_id=?').get(requestId)
    if (previous) {
      if (previous.actor_id !== user.id) return {error:'duplicate-other'}
      if (previous.payload_hash !== fingerprint) return {error:'duplicate'}
      return {movement:previous,replayed:true}
    }
    const origin=db.prepare('SELECT * FROM inventory WHERE id=?').get(fromId)
    if (!origin) return {error:'not-found'}
    if (!authCanWrite(user,origin.faction)) return {error:'forbidden'}
    if (!PLANETS.some(p=>p.id===toPlanet) || origin.planet===toPlanet ||
      !positive(quantity) || !nonNegative(ready) || ready>quantity || !reasonValid(reason)) return {error:'invalid'}
    if (origin.quantity < quantity || origin.ready < ready ||
        (origin.quantity - quantity) < (origin.ready - ready)) return {error:'insufficient'}
    const moved = db.prepare('UPDATE inventory SET quantity=quantity-?,ready=ready-? WHERE id=? AND quantity>=? AND ready>=?')
      .run(quantity,ready,origin.id,quantity,ready)
    if (moved.changes!==1) return {error:'insufficient'}
    let target = db.prepare('SELECT * FROM inventory WHERE era=? AND faction=? AND planet=? AND ship=?')
      .get(origin.era,origin.faction,toPlanet,origin.ship)
    if (!target) {
      db.prepare('INSERT INTO inventory(id,era,faction,planet,ship,quantity,ready) VALUES(?,?,?,?,?,?,?)')
        .run(randomUUID(),origin.era,origin.faction,toPlanet,origin.ship,0,0)
      target=db.prepare('SELECT * FROM inventory WHERE era=? AND faction=? AND planet=? AND ship=?')
        .get(origin.era,origin.faction,toPlanet,origin.ship)
    }
    db.prepare('UPDATE inventory SET quantity=quantity+?,ready=ready+? WHERE id=?').run(quantity,ready,target.id)
    const movement={id:randomUUID(),request_id:requestId,era:origin.era,faction:origin.faction,
      ship:origin.ship,from_planet:origin.planet,to_planet:toPlanet,quantity,ready,
      reason:reason.trim(),payload_hash:fingerprint,actor_id:user.id,created_at:isoTime()}
    db.prepare(`INSERT INTO movements(id,request_id,era,faction,ship,from_planet,to_planet,quantity,ready,reason,payload_hash,actor_id,created_at)
       VALUES(@id,@request_id,@era,@faction,@ship,@from_planet,@to_planet,@quantity,@ready,@reason,@payload_hash,@actor_id,@created_at)`)
      .run(movement)
    appendAudit(user.id,'TRANSFER','movement',movement.id,{fromId,toPlanet,quantity,ready,reason:movement.reason})
    return {movement,replayed:false}
  })
  function transfer(input) {
    if (!input?.user || !input.user.id) return {error:'unauthorized'}
    const {requestId,fromId,toPlanet,quantity,ready=quantity,reason} = input
    if (typeof requestId !== 'string' || !/^[a-zA-Z0-9_-]{10,80}$/.test(requestId)
      || typeof fromId!=='string' || typeof toPlanet!=='string') return {error:'invalid'}
    return executeTransfer.immediate({user:input.user,requestId,fromId,toPlanet,quantity,ready,reason})
  }

  const executeAdjust=db.transaction(({user,id,delta,readyDelta,reason})=>{
    const origin=db.prepare('SELECT * FROM inventory WHERE id=?').get(id)
    if (!origin) return {error:'not-found'}
    if (user.role!=='admin') return {error:'forbidden'}
    if (!Number.isSafeInteger(delta) || delta===0 || Math.abs(delta)>100000 ||
      !Number.isSafeInteger(readyDelta) || !reasonValid(reason)) return {error:'invalid'}
    const total=origin.quantity+delta, ready=origin.ready+readyDelta
    if (!nonNegative(total) || !nonNegative(ready) || ready>total) return {error:'insufficient'}
    db.prepare('UPDATE inventory SET quantity=?,ready=? WHERE id=?').run(total,ready,id)
    appendAudit(user.id,'ADJUST','inventory',id,{delta,readyDelta,reason:reason.trim(),before:origin.quantity,after:total})
    return {inventory:{...origin,quantity:total,ready}}
  })
  const adjust = input => input?.user ? executeAdjust.immediate(input) : {error:'unauthorized'}
  const audit=()=>db.prepare('SELECT id,actor_id,action,object_type,object_id,details,created_at FROM audit ORDER BY created_at DESC LIMIT 200').all()
  const movements=()=>db.prepare('SELECT * FROM movements ORDER BY created_at DESC LIMIT 100').all()
  const users=()=>db.prepare('SELECT id,username,role,faction_scope FROM users ORDER BY username').all().map(publicUser)
  return {db,findUser,login,logout,createUser,inventory,transfer,adjust,audit,movements,users,close:()=>db.close()}
}
