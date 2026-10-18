// Local development only (npm start). On Vercel the files in /api are the backend.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {getConfig,orderStatus,createOrder,stripeWebhook,kitchen,managerApi} from './lib/handlers.js'
import {persistent} from './lib/store.js'
process.env.ALWAYS_OPEN = process.env.ALWAYS_OPEN || '1'
const ROOT=path.dirname(fileURLToPath(import.meta.url)),PORT=+process.env.PORT||3000
const API={'/api/config':getConfig,'/api/order-status':orderStatus,'/api/orders':createOrder,'/api/stripe-webhook':stripeWebhook,'/api/kitchen':kitchen,'/api/manager':managerApi}
const MIME={'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png'}
http.createServer((req,res)=>{
 const p=new URL(req.url,'http://x').pathname
 if(API[p])return API[p](req,res)
 const rel=p.endsWith('/')?p+'index.html':p==='/cuisine'?'/cuisine/index.html':p==='/gerant'?'/gerant/index.html':p==='/'?'/index.html':p
 for(const dir of ['dist','public']){const f=path.normalize(path.join(ROOT,dir,rel));if(f.startsWith(path.join(ROOT,dir))&&fs.existsSync(f)&&fs.statSync(f).isFile()){res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});return fs.createReadStream(f).pipe(res)}}
 res.writeHead(404);res.end('Lancez npm run build pour voir le site (ou npm run dev).')
}).listen(PORT,()=>console.log(`Local → http://localhost:${PORT} (db: ${persistent?'supabase':'mémoire'})`))
