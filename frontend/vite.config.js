import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Em desenvolvimento, /api é repassado ao back-end Spring Boot (evita CORS).
// Em produção, defina VITE_API_URL com a URL completa da API.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.BACKEND_URL || 'http://localhost:8080',
    },
  },
})
