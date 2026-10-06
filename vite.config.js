import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// In dev (npm run dev) the API runs separately: npm start (port 3000)
export default defineConfig({plugins:[react()],base:'./',server:{proxy:{'/api':'http://localhost:3000'}}})
