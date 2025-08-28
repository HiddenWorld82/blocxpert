import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      '4e68af31b28b.ngrok-free.app',
      'bluebird-emerging-incredibly.ngrok.app',
      'blocxpert.dmii.ca'
    ]
  }
})
