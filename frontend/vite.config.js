import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind to all interfaces so the dev server works in cloud previews.
    host: '0.0.0.0',
    port: 5173,
    // Allow the cloud preview proxy host (otherwise Vite blocks it with 403).
    allowedHosts: true,
  },
})
