import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {getConfig,orderStatus,createOrder,stripeWebhook,kitchen,managerApi} from './lib/handlers.js'

function apiDevPlugin(){
 const API={'/api/config':getConfig,'/api/order-status':orderStatus,'/api/orders':createOrder,'/api/stripe-webhook':stripeWebhook,'/api/kitchen':kitchen,'/api/manager':managerApi}
 return {
  name:'api-dev-server',
  configureServer(server){
   server.middlewares.use((req,res,next)=>{
    const p=new URL(req.url,'http://localhost').pathname
    if(API[p]){
     return API[p](req,res)
    }
    next()
   })
  }
 }
}

export default defineConfig({
 plugins:[react(),apiDevPlugin()],
 base:'./'
})
