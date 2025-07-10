import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/BitCrafty/' : '/',
  root: './src',
  publicDir: '../image',
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
    // Copy the image directory to output
    copyPublicDir: true
  },
  server: {
    port: 3000,
    host: true
  }
}))
