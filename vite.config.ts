import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Plugin to copy data and image directories for build, and serve them in dev
function copyDataPlugin() {
  return {
    name: 'copy-data',
    configureServer(server) {
      // In development, serve data and image directories as static assets
      server.middlewares.use('/data', (req, res, next) => {
        const url = req.url
        const filePath = join(__dirname, 'data', url === '/' ? '' : url.slice(1))
        
        try {
          if (statSync(filePath).isFile()) {
            const content = readFileSync(filePath)
            res.setHeader('Content-Type', 'application/json')
            res.end(content)
          } else {
            next()
          }
        } catch (error) {
          next()
        }
      })
      
      server.middlewares.use('/image', (req, res, next) => {
        const url = req.url
        const filePath = join(__dirname, 'image', url === '/' ? '' : url.slice(1))
        
        try {
          if (statSync(filePath).isFile()) {
            const content = readFileSync(filePath)
            const ext = filePath.split('.').pop()
            const contentType = ext === 'svg' ? 'image/svg+xml' : 
                              ext === 'png' ? 'image/png' : 
                              ext === 'ico' ? 'image/x-icon' : 'application/octet-stream'
            res.setHeader('Content-Type', contentType)
            res.end(content)
          } else {
            next()
          }
        } catch (error) {
          next()
        }
      })
    },
    writeBundle() {
      function copyDir(src: string, dest: string) {
        mkdirSync(dest, { recursive: true })
        const entries = readdirSync(src)
        
        for (const entry of entries) {
          const srcPath = join(src, entry)
          const destPath = join(dest, entry)
          const stat = statSync(srcPath)
          
          if (stat.isDirectory()) {
            copyDir(srcPath, destPath)
          } else {
            copyFileSync(srcPath, destPath)
          }
        }
      }
      
      // Copy data directory
      const srcDataDir = join(__dirname, 'data')
      const destDataDir = join(__dirname, 'dist-react', 'data')
      copyDir(srcDataDir, destDataDir)
      console.log('✅ Data directory copied to dist-react/data')
      
      // Copy image directory
      const srcImageDir = join(__dirname, 'image')
      const destImageDir = join(__dirname, 'dist-react', 'image')
      copyDir(srcImageDir, destImageDir)
      console.log('✅ Image directory copied to dist-react/image')
    }
  }
}

export default defineConfig({
  plugins: [react(), copyDataPlugin()],
  base: process.env.GITHUB_PAGES === 'true' ? '/BitCrafty/' : '/',
  root: './src',
  build: {
    outDir: '../dist-react',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/main.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
