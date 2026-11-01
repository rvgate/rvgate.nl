import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { printToPdf } from './scripts/pdf.mjs'

/**
 * In `npm run dev` the PDF resumés don't exist on disk (they are made by
 * `npm run build`). This plugin prints them on the fly instead, so the
 * Resumé button also works during development.
 */
function resumePdfInDev() {
  return {
    name: 'resume-pdf-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/resume-([a-z]{2})\.pdf(?:\?.*)?$/)
        if (!match) return next()
        try {
          const base = server.resolvedUrls?.local?.[0] ?? `http://localhost:${server.config.server.port || 5173}/`
          const out = join(tmpdir(), `resume-${match[1]}-dev.pdf`)
          await printToPdf({ url: `${base}?lang=${match[1]}`, out })
          res.setHeader('Content-Type', 'application/pdf')
          res.end(readFileSync(out))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'text/plain')
          res.end(`Could not generate the PDF: ${error.message}`)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), resumePdfInDev()],
})
