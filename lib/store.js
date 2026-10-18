// Orders storage. Supabase (REST, service-role key, server side only) when configured;
// in-memory otherwise (local dev + tests). Same interface for both.
let rawU = (process.env.SUPABASE_URL || '').trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '')
rawU = rawU.replace(/\/rest\/v1\/?$/i, '')
const rawK = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/^['"]|['"]$/g, '')

// Clean URL: strip accidental postgres:// string or ensure https://
const isPostgresUri = rawU.startsWith('postgres://') || rawU.startsWith('postgresql://')
const U = isPostgresUri ? '' : rawU ? (rawU.startsWith('http') ? rawU : `https://${rawU}`) : ''
const K = rawK

const parseJson=x=>typeof x==='string'?(JSON.parse(x)||x):x
const fromRow=r=>r&&({
 id:r.id,
 number:+r.number,
 createdAt:Date.parse(r.created_at),
 status:r.status,
 paid:r.paid,
 type:r.type,
 payment:r.payment,
 total:r.total,
 discount:r.discount||0,
 items:parseJson(r.items)||[],
 customer:parseJson(r.customer)||{},
 note:r.note,
 tableNumber:r.table_number||'',
 promoCode:r.promo_code||'',
 stripeSession:r.stripe_session
})

const toRow=o=>({
 id:o.id,
 status:o.status,
 paid:o.paid,
 type:o.type,
 payment:o.payment,
 total:o.total,
 discount:o.discount||0,
 items:o.items,
 customer:o.customer,
 note:o.note,
 table_number:o.tableNumber||'',
 promo_code:o.promoCode||''
})

const COL={stripeSession:'stripe_session',stripePayment:'stripe_payment',tableNumber:'table_number',promoCode:'promo_code'}
const col=p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[COL[k]||k,v]))
const q=w=>Object.entries(w||{}).map(([k,v])=>`${k}=eq.${v}`).join('&')

function supabase(){
 const rest=async(path,o={})=>{
  if(isPostgresUri){
   throw new Error("SUPABASE_URL doit être l'URL REST (https://xxx.supabase.co), pas l'URI postgresql://")
  }
  if(!U||!U.startsWith('http')){
   throw new Error("SUPABASE_URL invalide. Utilisez l'URL https://xxx.supabase.co (Settings > API)")
  }
  let r
  try{
   r=await fetch(`${U}/rest/v1/${path}`,{...o,headers:{apikey:K,authorization:`Bearer ${K}`,'content-type':'application/json',...o.headers}})
  }catch(err){
   const cause=err.cause?.code||err.cause?.message||err.message
   throw new Error(`Connexion impossible à ${U.replace(/^https?:\/\//,'').slice(0,25)} (${cause}). Vérifiez si le projet Supabase est actif ou l'URL.`)
  }
  if(!r.ok){
   const msg=(await r.text()).slice(0,200)
   if(r.status===404&&msg.includes('orders')){
    throw new Error('Table "orders" manquante. Exécutez supabase/schema.sql dans SQL Editor.')
   }
   if(r.status===401||r.status===403){
    throw new Error(`Clé rejetée (${r.status}): ${msg.slice(0,100)} [Key length: ${K.length}, start: ${K.slice(0,6)}...]`)
   }
   throw new Error(`db ${r.status}: ${msg}`)
  }
  return r.status===204?null:r.json()
 }

 const ret={Prefer:'return=representation'}
 return{
  async insert(o){return fromRow((await rest('orders',{method:'POST',headers:ret,body:JSON.stringify(toRow(o))}))[0])},
  async get(id){return fromRow((await rest(`orders?id=eq.${encodeURIComponent(id)}&limit=1`))[0])},
  async update(id,patch,where){return fromRow((await rest(`orders?id=eq.${encodeURIComponent(id)}&${q(where)}`,{method:'PATCH',headers:ret,body:JSON.stringify(col(patch))}))[0])},
  async active(sinceMs){return(await rest(`orders?status=in.(new,accepted,ready)&created_at=gte.${encodeURIComponent(new Date(sinceMs).toISOString())}&order=created_at.asc`)).map(fromRow)},
  async recentByPhone(phone,sinceMs){return(await rest(`orders?select=id&customer->>phone=eq.${encodeURIComponent(phone)}&status=neq.cancelled&created_at=gte.${encodeURIComponent(new Date(sinceMs).toISOString())}`)).length},

  async getConfigData(){
   try{
    const res=await rest('config?id=eq.main&limit=1')
    const r=res&&res[0]
    if(!r) return {manualClosed:false,closedReason:'',forcedOpen:false,openMode:'auto',hours:null,ribIban:'',ribBic:'',ribHolder:'',smsEnabled:false}
    let cr=r.closed_reason||'', meta={}
    if(cr.includes('|||')){
     const parts=cr.split('|||')
     cr=parts[0]
     try{meta=JSON.parse(parts.slice(1).join('|||'))}catch{}
    }
    const forcedOpen=!!meta.forcedOpen
    const manualClosed=!!r.manual_closed
    const openMode=manualClosed?'closed':(forcedOpen?'forced_open':'auto')
    return {
     manualClosed,
     closedReason:cr,
     forcedOpen,
     openMode,
     hours:meta.hours||null,
     ribIban:r.rib_iban||'',
     ribBic:r.rib_bic||'',
     ribHolder:r.rib_holder||'',
     smsEnabled:!!r.sms_enabled
    }
   }catch{
    return {manualClosed:false,closedReason:'',forcedOpen:false,openMode:'auto',hours:null,ribIban:'',ribBic:'',ribHolder:'',smsEnabled:false}
   }
  },
  async updateConfigData(patch){
   const p={}
   const existing=await this.getConfigData().catch(()=>({}))
   const manualClosed = patch.manualClosed !== undefined ? !!patch.manualClosed : (patch.openMode ? patch.openMode === 'closed' : !!existing.manualClosed)
   const forcedOpen = patch.forcedOpen !== undefined ? !!patch.forcedOpen : (patch.openMode ? patch.openMode === 'forced_open' : !!existing.forcedOpen)
   const hours = patch.hours !== undefined ? patch.hours : (existing.hours || null)
   const closedReason = patch.closedReason !== undefined ? patch.closedReason : (existing.closedReason || '')

   p.manual_closed = manualClosed
   p.closed_reason = (closedReason || '') + '|||' + JSON.stringify({ forcedOpen, hours })
   if(patch.ribIban!==undefined)p.rib_iban=patch.ribIban
   if(patch.ribBic!==undefined)p.rib_bic=patch.ribBic
   if(patch.ribHolder!==undefined)p.rib_holder=patch.ribHolder
   if(patch.smsEnabled!==undefined)p.sms_enabled=patch.smsEnabled
   await rest('config?id=eq.main',{method:'PATCH',headers:ret,body:JSON.stringify(p)})
  },
  async getMenuOverrides(){
   try{
    const rows=await rest('menu_overrides?select=*')
    return Object.fromEntries((rows||[]).map(r=>[r.id,{price:r.price,outOfStock:!!r.out_of_stock}]))
   }catch{
    return {}
   }
  },
  async saveMenuOverride(id,patch){
   const p={id}
   if(patch.price!==undefined)p.price=patch.price
   if(patch.outOfStock!==undefined)p.out_of_stock=patch.outOfStock
   await rest('menu_overrides',{method:'POST',headers:{...ret,Prefer:'resolution=merge-duplicates'},body:JSON.stringify(p)})
  },

  async getPromos(){
   try{
    const rows=await rest('promos?select=*')
    return Object.fromEntries((rows||[]).map(r=>[r.code,{code:r.code,discountType:r.discount_type,discountValue:r.discount_value,active:!!r.active}]))
   }catch{ return {} }
  },
  async savePromo(code,patch){
   const p={code:code.toUpperCase().trim(),discount_type:patch.discountType||'percent',discount_value:+patch.discountValue||0,active:patch.active!==false}
   await rest('promos',{method:'POST',headers:{...ret,Prefer:'resolution=merge-duplicates'},body:JSON.stringify(p)})
   return await this.getPromos()
  },
  async deletePromo(code){
   try{await rest(`promos?code=eq.${encodeURIComponent(code.toUpperCase().trim())}`,{method:'DELETE'})}catch{}
   return await this.getPromos()
  },
  async getSalesReport(sinceMs){
   try{
    const rows=await rest(`orders?status=neq.cancelled&created_at=gte.${encodeURIComponent(new Date(sinceMs).toISOString())}&order=created_at.desc`)
    return (rows||[]).map(fromRow)
   }catch{ return [] }
  },
  async getCustomItems(){
   const res={}
   try{
    const rows=await rest('custom_items?select=*')
    if(Array.isArray(rows)){
     rows.forEach(r=>{res[r.id]={id:r.id,name:r.name,cat:r.cat||'Divers',price:r.price,desc:r.desc||''}})
    }
   }catch{}
   try{
    const ovRows=await rest('menu_overrides?select=*')
    if(Array.isArray(ovRows)){
     ovRows.forEach(r=>{
      if(r.id&&r.id.startsWith('custom:')&&r.price&&r.price>0){
       const parts=r.id.split(':')
       // Encoded format: custom:TIMESTAMP:name:cat:desc (>=5 parts)
       if(parts.length>=5){
        const realId=parts[0]+':'+parts[1]
        if(!res[realId]){
         const name=decodeURIComponent(parts[2]||'')
         const cat=decodeURIComponent(parts[3]||'Divers')
         const desc=decodeURIComponent(parts.slice(4).join(':'))
         res[realId]={id:realId,name,cat,price:r.price,desc}
        }
       }
      }
     })
    }
   }catch{}
   return res
  },
  async saveCustomItem(id,item){
   const p={id,name:item.name,cat:item.cat||'Divers',price:+item.price,desc:item.desc||''}
   // Encode name/cat/desc into the override id so fallback read can reconstruct full item
   const encodedId=`${id}:${encodeURIComponent(item.name||'')}:${encodeURIComponent(item.cat||'Divers')}:${encodeURIComponent(item.desc||'')}`
   try{
    await rest('menu_overrides',{method:'POST',headers:{...ret,Prefer:'resolution=merge-duplicates'},body:JSON.stringify({id:encodedId,price:+item.price,out_of_stock:false})})
   }catch{}
   try{
    await rest('custom_items',{method:'POST',headers:{...ret,Prefer:'resolution=merge-duplicates'},body:JSON.stringify(p)})
   }catch{}
   return await this.getCustomItems()
  },
  async deleteCustomItem(id){
   // Delete exact id match AND encoded-id entries that start with this id (fallback encoding)
   try{await rest(`menu_overrides?id=like.${encodeURIComponent(id+'%')}`,{method:'DELETE'})}catch{}
   try{await rest(`custom_items?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'})}catch{}
   return await this.getCustomItems()
  }
 }}

function memory(){
 const rows=[];let seq=0
 let memConfig={manualClosed:false,closedReason:'',forcedOpen:false,openMode:'auto',hours:null,ribIban:'',ribBic:'',ribHolder:'',smsEnabled:false}
 const memOverrides={}
 const memPromos={}
 const memCustomItems={}
 return{
  async insert(o){const r={...o,number:++seq,createdAt:Date.now()};rows.push(r);return{...r}},
  async get(id){const r=rows.find(x=>x.id===id);return r&&{...r}},
  async update(id,patch,where={}){const r=rows.find(x=>x.id===id);if(!r||Object.entries(where).some(([k,v])=>String(r[k])!==String(v)))return null;Object.assign(r,patch);return{...r}},
  async active(since){return rows.filter(r=>['new','accepted','ready'].includes(r.status)&&r.createdAt>=since).map(r=>({...r}))},
  async recentByPhone(p,since){return rows.filter(r=>r.customer.phone===p&&r.status!=='cancelled'&&r.createdAt>=since).length},

  async getConfigData(){return {...memConfig}},
  async updateConfigData(p){
   const manualClosed = p.manualClosed !== undefined ? !!p.manualClosed : (p.openMode ? p.openMode === 'closed' : !!memConfig.manualClosed)
   const forcedOpen = p.forcedOpen !== undefined ? !!p.forcedOpen : (p.openMode ? p.openMode === 'forced_open' : !!memConfig.forcedOpen)
   const openMode = manualClosed ? 'closed' : (forcedOpen ? 'forced_open' : 'auto')
   const hours = p.hours !== undefined ? p.hours : memConfig.hours
   const closedReason = p.closedReason !== undefined ? p.closedReason : memConfig.closedReason
   Object.assign(memConfig, p, { manualClosed, forcedOpen, openMode, hours, closedReason })
   return {...memConfig}
  },
  async getMenuOverrides(){return {...memOverrides}},
  async saveMenuOverride(id,p){memOverrides[id]=Object.assign(memOverrides[id]||{},p);return memOverrides[id]},

  async getPromos(){return {...memPromos}},
  async savePromo(code,patch){
   const c=code.toUpperCase().trim()
   memPromos[c]={code:c,discountType:patch.discountType||'percent',discountValue:+patch.discountValue||0,active:patch.active!==false}
   return {...memPromos}
  },
  async deletePromo(code){
   delete memPromos[code.toUpperCase().trim()]
   return {...memPromos}
  },
  async getSalesReport(sinceMs){
   return rows.filter(r=>r.status!=='cancelled'&&r.createdAt>=sinceMs).map(fromRow)
  },
  async getCustomItems(){
   return {...memCustomItems}
  },
  async saveCustomItem(id,item){
   memCustomItems[id]={id,name:item.name,cat:item.cat||'Divers',price:+item.price,desc:item.desc||''}
   memOverrides[id]={price:+item.price,outOfStock:false}
   return {...memCustomItems}
  },
  async deleteCustomItem(id){
   delete memCustomItems[id]
   delete memOverrides[id]
   return {...memCustomItems}
  }
 }}

let lastDbError = null

function withFallback(sb, mem) {
 let warned = false
 const wrap = (method) => async (...args) => {
  try {
   const res = await sb[method](...args)
   lastDbError = null
   return res
  } catch (e) {
   lastDbError = e.message
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
  recentByPhone: wrap('recentByPhone'),
  getConfigData: wrap('getConfigData'),
  updateConfigData: wrap('updateConfigData'),
  getMenuOverrides: wrap('getMenuOverrides'),
  saveMenuOverride: wrap('saveMenuOverride'),
  getPromos: wrap('getPromos'),
  savePromo: wrap('savePromo'),
  deletePromo: wrap('deletePromo'),
  getSalesReport: wrap('getSalesReport'),
  getCustomItems: wrap('getCustomItems'),
  saveCustomItem: wrap('saveCustomItem'),
  deleteCustomItem: wrap('deleteCustomItem')
 }
}

export const store=(rawU&&rawK)?withFallback(supabase(),memory()):memory()
export const persistent=!!(rawU&&rawK)
export const getDbStatus=()=>({persistent,error:lastDbError})
