import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const shouldProxyApiRoutes = !process.env.VERCEL

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: shouldProxyApiRoutes
    ? {
        proxy: {
          '/api': {
            target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      }
    : undefined,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
