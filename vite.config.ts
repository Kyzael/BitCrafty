import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './src',
  publicDir: '../',
  build: {
    outDir: '../dist-react',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/main.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    // Specify what should be copied to the output directory
    copyPublicDir: false
  },
  server: {
    port: 3000,
    host: true
  }
})
