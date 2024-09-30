import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'  // Ensure the build directory is correctly set to 'dist'
  },
  server: {
    host: true,
    port: 8000,
    watch: {
      usePolling: true,
    },
  },
})
