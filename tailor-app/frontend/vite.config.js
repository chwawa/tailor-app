import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "tailor-ra",
    project: "javascript-react"
  })],
  server: {
    host: '0.0.0.0',  
    port: 5173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      context: 'globalThis',
      external: ['@rollup/rollup-linux-x64-gnu']
    }
  }
})