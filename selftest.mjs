// npm run test:server — exercises the real handlers (in-memory db, Stripe simulated)
import http from 'node:http';import crypto from 'node:crypto';import {spawn} from 'node:child_process'
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let got=null
const mock=http.createServer((q,s)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{got=new URLSearchParams(b);s.writeHead(200,{'content-type':'application/json'});s.end(JSON.stringify({id:'cs_test_1',url:'https://checkout.stripe.com/c/pay/cs_test_1'}))})}).listen(4999)
const env={...process.env,PORT:'3111',ALWAYS_OPEN:'1',STRIPE_SECRET_KEY:'sk_test_x',STRIPE_WEBHOOK_SECRET:'whsec_test',STRIPE_API_BASE:'http://localhost:4999',KITCHEN_PASSWORD:'pw'}
delete env.SUPABASE_URL
const srv=spawn('node',['dev-server.js'],{env,stdio:'ignore'});await sleep(900)
const B='http://localhost:3111',K={'x-kitchen-key':'pw'}
const post=(p,o,h={})=>fetch(B+p,{method:'POST',headers:h,body:typeof o==='string'?o:JSON.stringify(o)})
const kit=async()=>(await (await fetch(B+'/api/kitchen',{headers:K})).json()).orders
const cust={name:'Test',phone:'0612345678',address:'1 rue X',postcode:'75002'}
let fails=0;const ok=(n,c)=>{if(!c)fails++;console.log(c?'PASS':'FAIL',n)}

// Test 1: On-site order with valid catalog pizza (Large = 15.50€)
let r=await post('/api/orders',{type:'emporter',payment:'sur_place',items:[{id:'pizzas:regina-royale:large-33cm',qty:1,price:1}],customer:cust});let j=await r.json();ok('on-site order created',r.status===201&&j.number===1)

// Test 2: Unknown item rejected
r=await post('/api/orders',{type:'emporter',payment:'sur_place',items:[{id:'hack',qty:1}],customer:cust});ok('unknown item rejected',r.status===400)

// Test 3: Delivery minimum 18€ enforced (1 burger = 12.90€ < 18€)
r=await post('/api/orders',{type:'livraison',payment:'sur_place',items:[{id:'burgers:double-smash-cheese',qty:1}],customer:cust});ok('delivery minimum enforced',r.status===400)

// Test 4: Kitchen unauthorized check
r=await fetch(B+'/api/kitchen');ok('kitchen without key = 401',r.status===401)

// Test 5: Kitchen sees on-site order at catalog price (1550)
let L=await kit();ok('kitchen sees on-site order at catalog price (1550)',L.length===1&&L[0].total===1550)

// Test 6: Online order returns stripe url (XXL = 2100, Drink = 300)
r=await post('/api/orders',{type:'emporter',payment:'online',items:[{id:'pizzas:regina-royale:xxl-partage-40cm',qty:1},{id:'boissons:coca-cola-vintage-bouteille-verre',qty:1}],customer:{...cust,phone:'0699999999',email:'a@b.fr'}});j=await r.json()
ok('online order returns stripe url',r.status===201&&j.url?.includes('stripe'))
ok('stripe amounts come from catalog (2100, 300)',got.get('line_items[0][price_data][unit_amount]')==='2100'&&got.get('line_items[1][price_data][unit_amount]')==='300')
ok('unpaid order hidden from kitchen',(await kit()).length===1)

// Webhook validation tests
const evt=a=>JSON.stringify({type:'checkout.session.completed',data:{object:{metadata:{order_id:j.id},payment_status:'paid',amount_total:a,payment_intent:'pi_1'}}})
const sign=(raw,secret='whsec_test')=>{const t=Math.floor(Date.now()/1000);return `t=${t},v1=${crypto.createHmac('sha256',secret).update(`${t}.${raw}`).digest('hex')}`}
let raw=evt(2400);r=await post('/api/stripe-webhook',raw,{'stripe-signature':sign(raw,'wrong')});ok('bad signature rejected',r.status===400)
raw=evt(100);await post('/api/stripe-webhook',raw,{'stripe-signature':sign(raw)});ok('wrong amount not released',(await kit()).length===1)
raw=evt(2400);r=await post('/api/stripe-webhook',raw,{'stripe-signature':sign(raw)});await post('/api/stripe-webhook',raw,{'stripe-signature':sign(raw)});L=await kit()
ok('valid webhook releases paid order (retry harmless)',r.status===200&&L.length===2&&L[1].paid===true)

const paid=L.find(o=>o.paid)
r=await post('/api/kitchen',{id:paid.id,status:'ready'},K);ok('cannot skip a step (new→ready refused)',r.status===400)
r=await post('/api/kitchen',{id:paid.id,status:'accepted'},K);ok('accept works',(await r.json()).status==='accepted')
r=await fetch(B+'/api/order-status?id='+j.id);ok('public status is minimal',Object.keys(await r.json()).sort().join()==='id,number,paid,status')

for(let i=0;i<4;i++)r=await post('/api/orders',{type:'emporter',payment:'sur_place',items:[{id:'desserts:tiramisu-maison-tradizionale',qty:1}],customer:{...cust,phone:'0711111111'}})
ok('4th order from same phone in 30 min blocked (429)',r.status===429)

r=await fetch(B+'/cuisine');ok('kitchen page served',r.status===200&&(await r.text()).includes('Écran cuisine'))
srv.kill();mock.close();console.log(fails?`${fails} FAILED`:'ALL PASSED');process.exit(fails?1:0)
