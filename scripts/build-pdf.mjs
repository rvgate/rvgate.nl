/*
 * Generates a PDF of the site per language (dist/resume-<lang>.pdf) by
 * serving the production build and printing it with headless Chrome.
 * The look comes from the print styles (@media print).
 *
 * Runs after `vite build` (see package.json). Set SKIP_PDF=1 to skip,
 * or CHROME_BIN=/path/to/chrome to choose the browser.
 */
import { statSync } from 'node:fs'
import { resolve } from 'node:path'
import { preview } from 'vite'
import content from '../src/content.js'
import { findChrome, printToPdf } from './pdf.mjs'

if (process.env.SKIP_PDF) {
  console.log('SKIP_PDF set: not generating PDFs')
  process.exit(0)
}

const chrome = findChrome()
const server = await preview({ preview: { port: 4179, strictPort: false }, logLevel: 'warn' })
const base = server.resolvedUrls.local[0]

try {
  for (const code of Object.keys(content.languages)) {
    const out = resolve('dist', `resume-${code}.pdf`)
    await printToPdf({ url: `${base}?lang=${code}`, out, chrome })
    console.log(`✓ ${out} (${Math.round(statSync(out).size / 1024)} kB)`)
  }
} finally {
  await (server.close?.() ?? new Promise((r) => server.httpServer.close(r)))
}
