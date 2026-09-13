import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const apiOrigin = process.env.FLOW_DEV_API ?? 'http://127.0.0.1:8443'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../flow-server/cmd/web/static',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiOrigin,
        changeOrigin: true,
      },
    },
  },
})
