import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['maxmavn8n.loca.lt']
  },
  build: {
    outDir: 'dist',
    // sourcemap в prod увеличивает размер деплоя — включайте только для отладки
    sourcemap: false,
  }
}) 