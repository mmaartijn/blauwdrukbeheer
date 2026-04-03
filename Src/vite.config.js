import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// Custom plugin to serve the /Data folder at /data
function serveDataPlugin() {
  return {
    name: 'serve-data-dir',
    configureServer(server) {
      server.middlewares.use('/data', (req, res, next) => {
        // Construct path to ../Data
        const __dirname = path.dirname(fileURLToPath(import.meta.url))
        const filePath = path.join(__dirname, '..', 'Data', req.url.split('?')[0])
        
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
             if (filePath.endsWith('.json')) {
               fs.writeFileSync(filePath, body)
               res.setHeader('Content-Type', 'application/json')
               res.end(JSON.stringify({success: true}))
             } else {
               res.statusCode = 400
               res.end('Bad Request')
             }
          })
          return
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Content-Type', 'application/json')
          res.end(fs.readFileSync(filePath))
        } else {
          next()
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    serveDataPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
