import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import {fileURLToPath} from 'node:url'
import { buildApp } from './app.js'

const dbPath=process.env.HOLONET_DB_PATH ? resolve(process.env.HOLONET_DB_PATH) : fileURLToPath(new URL('../data/fleet.db',import.meta.url))
mkdirSync(dirname(dbPath),{recursive:true,mode:0o700})
const {app}=await buildApp({
 dbPath,bootstrapUsername:process.env.ADMIN_USERNAME,bootstrapPassword:process.env.ADMIN_PASSWORD,
 logger:{level:'warn',redact:['req.headers.authorization','req.body.password','res.headers.set-cookie']}
})
const host=process.env.HOST||'127.0.0.1'
const port=Number(process.env.PORT||4358)
if(!Number.isSafeInteger(port)||port<1024||port>65535)throw Error('PORT precisa ser um inteiro entre 1024 e 65535.')
if(host!=='127.0.0.1' && process.env.HOLONET_ALLOW_NETWORK!=='yes') {
 throw Error('Rede externa bloqueada por padrão. Use HOST=127.0.0.1 ou habilite explicitamente com proxy TLS/autorização.')
}
await app.listen({host,port})
console.log('HOLO-NET FLEET API on http://'+host+':'+port+'/api/v1/health (local-only by default)')
const halt=async()=>{await app.close();process.exit(0)}
process.once('SIGTERM',halt)
process.once('SIGINT',halt)
