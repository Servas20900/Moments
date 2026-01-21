import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/paquetes': 'http://localhost:3000',
      '/vehiculos': 'http://localhost:3000',
      '/eventos': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/usuarios': 'http://localhost:3000',
      '/reservas': 'http://localhost:3000',
      '/experiencias': 'http://localhost:3000',
      '/imagenes': 'http://localhost:3000',
      '/resenas': 'http://localhost:3000',
      '/notificaciones': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
})
