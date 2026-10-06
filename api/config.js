import {getConfig as config_} from '../lib/handlers.js'
export const config={api:{bodyParser:false}} // we read the raw body ourselves (needed for Stripe's signature)
export default config_
