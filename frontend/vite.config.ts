// frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // 1️⃣ Tell Vite where .env lives (one level up)
  const envDir = path.resolve(__dirname, '../')
  // 2️⃣ Load only VITE_* vars from that dir
  const env = loadEnv(mode, envDir, 'VITE_')

  return {
    // so import.meta.env in your React code sees vars from ../.env
    envDir,

    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    // 3️⃣ Replace import.meta.env.VITE_BACKEND_URL in your code
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
    },

    // 4️⃣ Proxy all /rpc calls to your backend
    server: {
      proxy: {
        '/rpc': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,       // if you're on HTTPS dev, otherwise can omit
          rewrite: (p) => p   // leave path intact
        }
      }
    }
  }
})
