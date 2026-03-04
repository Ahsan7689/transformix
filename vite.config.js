import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  server: {
    headers: {
      // COOP is fine — keeps window isolation
      'Cross-Origin-Opener-Policy': 'same-origin',
      // REMOVED 'require-corp' — it blocked all cross-origin images (Pollinations, etc.)
      // ffmpeg WASM works without COEP in modern Vite via SharedArrayBuffer fallback
      'Cross-Origin-Embedder-Policy': 'credentialless',
    }
  }
})