import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  server: {
    // NO Cross-Origin-Embedder-Policy header at all
    // This allows external images (Pollinations, etc.) to load freely
    // ffmpeg still works via its own WASM loading mechanism
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    // Proxy Pollinations requests through Vite to avoid CORS/COEP entirely
    proxy: {
      '/api/image': {
        target: 'https://image.pollinations.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/image/, ''),
        secure: false,
      }
    }
  }
})
