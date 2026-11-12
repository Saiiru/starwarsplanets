const API_ROOT = 'https://swapi.dev/api/planets/'

/**
 * Retrieve the complete public SWAPI planet list, not only page one.
 * Pagination is bounded and restricted to the expected SWAPI endpoint.
 */
export async function apiCall(url = API_ROOT, fetcher = fetch) {
  const all = []
  const seen = new Set()
  let next = url
  let pages = 0

  while (next && pages < 10) {
    const target = new URL(next, API_ROOT)
    if (target.origin !== new URL(API_ROOT).origin || !target.pathname.startsWith('/api/planets/')) {
      throw new Error('A API retornou um endereço de paginação inesperado.')
    }
    if (seen.has(target.href)) throw new Error('A API retornou uma paginação circular.')
    seen.add(target.href)
    const response = await fetcher(target.href, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000)
    })
    if (!response.ok) throw new Error('A API respondeu com HTTP ' + response.status)
    const body = await response.json()
    if (!Array.isArray(body.results)) throw new Error('Formato inesperado dos dados.')
    all.push(...body.results)
    next = body.next
    pages += 1
  }

  if (next) throw new Error('Paginação excedeu o limite de segurança.')
  return { results: all, count: all.length }
}
