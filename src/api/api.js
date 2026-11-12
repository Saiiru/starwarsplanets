// SWAPI public catalog adapter. Faction control is NOT available in SWAPI; it is
// provided separately from curated, era-specific Lucasfilm Databank evidence.
const ROOT='https://swapi.dev/api/'
const ALLOWED=new Set(['planets','starships','vehicles'])
export const swapiUrl=(resource)=> {
 if(!ALLOWED.has(resource))throw new Error('Tipo de catálogo SWAPI desconhecido.')
 return ROOT+resource+'/'
}

/** Bounded pagination with strict host, path and cycle checks. */
export async function apiCall(url=swapiUrl('planets'), fetcher=fetch) {
 const first=new URL(url)
 const resource=first.pathname.split('/')[2]
 if(first.origin!==new URL(ROOT).origin || !ALLOWED.has(resource)
    || !first.pathname.startsWith('/api/'+resource+'/'))throw new Error('Endereço SWAPI inválido.')
 const all=[]
 const seen=new Set()
 let next=first.href
 let pages=0
 while(next && pages<15) {
  const target=new URL(next)
  if(target.origin!==first.origin || target.pathname!=='/api/'+resource+'/' || seen.has(target.href))
   throw new Error('A API retornou um endereço inesperado ou circular.')
  seen.add(target.href)
  const response=await fetcher(target.href,{
   headers:{Accept:'application/json'},
   signal:AbortSignal.timeout(15000)
  })
  if(!response.ok)throw new Error('A SWAPI respondeu com HTTP '+response.status)
  const body=await response.json()
  if(!Array.isArray(body.results))throw new Error('Formato inesperado dos dados.')
  all.push(...body.results)
  next=body.next
  pages+=1
 }
 if(next)throw new Error('Paginação excedeu o limite de segurança.')
 return {results:all,count:all.length,resource}
}
