import test from 'node:test'
import assert from 'node:assert/strict'
import { apiCall } from '../src/api/api.js'

const respond = (data, ok = true, status = 200) => ({ ok, status, json: async () => data })

test('requests all pages and retains all planets', async () => {
  const pages = []
  const fake = async url => {
    pages.push(url)
    return url.includes('page=2')
      ? respond({results:[{name:'Naboo'}],next:null})
      : respond({results:[{name:'Tatooine'}],next:'https://swapi.dev/api/planets/?page=2'})
  }
  const result = await apiCall('https://swapi.dev/api/planets/', fake)
  assert.equal(result.count, 2)
  assert.deepEqual(result.results.map(p=>p.name),['Tatooine','Naboo'])
  assert.equal(pages.length,2)
})

test('does not fetch arbitrary hosts from external pagination', async () => {
  let calls = 0
  const fake = async () => {calls++;return respond({results:[],next:'https://example.com/private'})}
  await assert.rejects(apiCall(undefined,fake), /inesperado/)
  assert.equal(calls,1)
})

test('cycles, failures, malformed results and unbounded pages return errors', async () => {
  await assert.rejects(apiCall(undefined,async () => respond({},true)),/inesperado/)
  await assert.rejects(apiCall(undefined,async () => respond({},false,429)),/429/)
  await assert.rejects(apiCall(undefined,async () => respond({results:[],next:'https://swapi.dev/api/planets/'})),/circular/)
  let page=0
  await assert.rejects(apiCall(undefined,async () => respond({results:[],next:'https://swapi.dev/api/planets/?page='+ ++page})),/limite/)
})
