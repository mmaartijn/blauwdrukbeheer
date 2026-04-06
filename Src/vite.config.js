import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// Kopieert /Data/*.json naar dist/data/ bij npm run build.
// Dient als statische fallback als de gebruiker nog geen data-repo geconfigureerd heeft.
function copyDataPlugin() {
  return {
    name: 'copy-data-to-dist',
    writeBundle(options) {
      const __dirname = path.dirname(fileURLToPath(import.meta.url))
      const src = path.join(__dirname, '..', 'Data')
      const dest = path.join(options.dir, 'data')
      fs.mkdirSync(dest, { recursive: true })
      for (const file of fs.readdirSync(src)) {
        if (file.endsWith('.json')) {
          fs.copyFileSync(path.join(src, file), path.join(dest, file))
        }
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/blauwdrukbeheer/' : '/',
  plugins: [
    vue(),
    tailwindcss(),
    copyDataPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
