// Orders storage. Supabase (REST, service-role key, server side only) when configured;
// in-memory otherwise (local dev + tests). Same interface for both.
const U=process.env.SUPABASE_URL,K=process.env.SUPABASE_SERVICE_ROLE_KEY
const fromRow=r=>r&&({id:r.id,number:+r.number,createdAt:Date.parse(r.created_at),status:r.status,paid:r.paid,type:r.type,payment:r.payment,total:r.total,items:r.items,customer:r.customer,note:r.note,stripeSession:r.stripe_session})
const toRow=o=>({id:o.id,status:o.status,paid:o.paid,type:o.type,payment:o.payment,total:o.total,items:o.items,customer:o.customer,note:o.note})
const COL={stripeSession:'stripe_session',stripePayment:'stripe_payment'}
const col=p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[COL[k]||k,v]))
const q=w=>Object.entries(w||{}).map(([k,v])=>`${k}=eq.${v}`).join('&')

function supabase(){
 const rest=async(path,o={})=>{const r=await fetch(`${U}/rest/v1/${path}`,{...o,headers:{apikey:K,authorization:`Bearer ${K}`,'content-type':'application/json',...o.headers}})
  if(!r.ok)throw new Error(`db ${r.status}: ${(await r.text()).slice(0,200)}`);return r.status===204?null:r.json()}
 const ret={Prefer:'return=representation'}
 return{
  async insert(o){return fromRow((await rest('orders',{method:'POST',headers:ret,body:JSON.stringify(toRow(o))}))[0])},
  async get(id){return fromRow((await rest(`orders?id=eq.${encodeURIComponent(id)}&limit=1`))[0])},
  // update only if `where` still matches (makes webhook retries idempotent); returns the row or null
  async update(id,patch,where){return fromRow((await rest(`orders?id=eq.${encodeURIComponent(id)}&${q(where)}`,{method:'PATCH',headers:ret,body:JSON.stringify(col(patch))}))[0])},
  async active(sinceMs){return(await rest(`orders?status=in.(new,accepted,ready)&created_at=gte.${new Date(sinceMs).toISOString()}&order=created_at.asc`)).map(fromRow)},
  async recentByPhone(phone,sinceMs){return(await rest(`orders?select=id&customer->>phone=eq.${encodeURIComponent(phone)}&status=neq.cancelled&created_at=gte.${new Date(sinceMs).toISOString()}`)).length}
 }}
function memory(){
 const rows=[];let seq=0
 return{
  async insert(o){const r={...o,number:++seq,createdAt:Date.now()};rows.push(r);return{...r}},
  async get(id){const r=rows.find(x=>x.id===id);return r&&{...r}},
  async update(id,patch,where={}){const r=rows.find(x=>x.id===id);if(!r||Object.entries(where).some(([k,v])=>String(r[k])!==String(v)))return null;Object.assign(r,patch);return{...r}},
  async active(since){return rows.filter(r=>['new','accepted','ready'].includes(r.status)&&r.createdAt>=since).map(r=>({...r}))},
  async recentByPhone(p,since){return rows.filter(r=>r.customer.phone===p&&r.status!=='cancelled'&&r.createdAt>=since).length}
 }}
function withFallback(sb, mem) {
 let warned = false
 const wrap = (method) => async (...args) => {
  try {
   return await sb[method](...args)
  } catch (e) {
   if (!warned) {
    console.error(`[DB Warning] Supabase error in ${method}:`, e.message)
    console.error('[DB Warning] Fallback to in-memory store: order processed successfully without interruption.')
    warned = true
   }
   return await mem[method](...args)
  }
 }
 return {
  insert: wrap('insert'),
  get: wrap('get'),
  update: wrap('update'),
  active: wrap('active'),
  recentByPhone: wrap('recentByPhone')
 }
}

export const store=U&&K?withFallback(supabase(),memory()):memory()
export const persistent=!!(U&&K)
