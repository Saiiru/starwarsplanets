import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {join,dirname} from 'node:path'
import {buildApp} from '../src/app.js'

const root=dirname(fileURLToPath(import.meta.url))
const {dataset,description,cases}=JSON.parse(readFileSync(join(root,'../eval/questions.json'),'utf8'))
const routing=process.argv.includes('--llm')?'llm':'rules'
const results=[]
let app=null
try{
 for(let index=0;index<cases.length;index++){
  // Rate limit stays active; separate ephemeral stores after 20 cases.
  if(index%20===0){
   if(app)await app.close()
   const instance=await buildApp({dbPath:':memory:',bootstrapUsername:'evaluation-admin',
     bootstrapPassword:'temporary-evaluation-passphrase',llmConfig:null})
   app=instance.app
  }
  const example=cases[index]
  const response=await app.inject({method:'POST',url:'/api/v1/ask',
   payload:{question:example.question,era:example.era,mode:routing}})
  const output=response.json()
  const expected=example.expected
  const checks={
   status:response.statusCode===200&&output.status===expected.status,
   intent:output.intent===expected.intent,
   evidence:output.evidence===expected.evidence,
   field:!expected.field||output.data?.[expected.field]===expected.value,
   source:expected.evidence==='canon'?output.sources.some(v=>v.url?.startsWith('https://www.starwars.com/')):true,
   safe:output.guarantees?.readOnly===true&&output.guarantees?.writesAllowed===false
  }
  results.push({id:example.id,question:example.question,passed:Object.values(checks).every(Boolean),
   checks,latencyMs:output.latencyMs,route:output.route,status:output.status,intent:output.intent})
 }
} finally{if(app)await app.close()}
const sorted=results.map(item=>item.latencyMs).sort((a,b)=>a-b)
const percentile=p=>sorted[Math.min(sorted.length-1,Math.ceil(p*sorted.length)-1)]
const passed=results.filter(item=>item.passed).length
const counts=field=>Object.fromEntries([...new Set(results.map(item=>item[field]))]
 .map(key=>[key,results.filter(item=>item[field]===key).length]))
const report={
 dataset,description,evaluatedAt:new Date().toISOString(),mode:routing,
 summary:{cases:cases.length,passed,accuracy:passed/cases.length,
  p50LatencyMs:percentile(.5),p95LatencyMs:percentile(.95),
  routing:counts('route'),status:counts('status')},
 limitations:[
  'Cases were written using the same finite curated catalog; not held-out unseen questions.',
  'Quantities are a synthetic demo fixture; not Star Wars canonical unit counts.',
  'Natural language parser is rule-based; --llm uses deterministic fallback unless an actual loopback model is configured.',
  'Lexical lore search is not vector embeddings or semantic RAG.',
  'Latency excludes browser/UI and any remote model inference in rules mode.'
 ],
 failures:results.filter(item=>!item.passed)
}
const destination=join(root,'../eval/latest-results.json')
writeFileSync(destination,JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report.summary,null,2))
console.log('EVAL_REPORT:',destination)
if(passed!==cases.length){
 console.error('FAILED_CASES:',JSON.stringify(report.failures,null,2))
 process.exitCode=1
}
