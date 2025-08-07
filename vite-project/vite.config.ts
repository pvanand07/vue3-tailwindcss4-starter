import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
  proxy: {
    '/api/v1/chat': {
      target: 'https://api4iresearcher-v5.elevatics.site',
      changeOrigin: true,
      configure: (proxy, _options) => {
        proxy.on('proxyReq', (proxyReq, _req, _res) => {
          // Add API key to all requests
          proxyReq.setHeader('X-API-Key', '44d5c2ac18ced6fc25c1e57dcdfygmdmrstt4577bf56e67540671a647465df4')
        })
        
        proxy.on('proxyRes', (proxyRes, _req, _res) => {
          // Remove or modify headers that reveal the external domain
          delete proxyRes.headers['x-served-by']
          delete proxyRes.headers['server']
          
          // Optionally set custom headers to mask the origin
          proxyRes.headers['x-powered-by'] = 'Vue Chat App'
          proxyRes.headers['server'] = 'Vite Dev Server'
        })
      }
    }
  }
}
})
