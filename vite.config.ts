import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      /** FastAPI 백엔드 */
      '/backend-api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend-api/, ''),
      },
      /** ODcloud 직접 연동 (백엔드 미사용 시) */
      '/odcloud-api': {
        target: 'https://api.odcloud.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/odcloud-api/, '/api'),
      },
    },
  },
})
