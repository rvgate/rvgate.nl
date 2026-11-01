/*
 * Shared helpers to print a page of the site to PDF with headless
 * Chrome/Chromium. Used by scripts/build-pdf.mjs (production build) and
 * by the dev-server plugin in vite.config.js.
 */
import { execFile, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export function findChrome() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    const found = spawnSync('which', [name], { encoding: 'utf8' })
    if (found.status === 0) return found.stdout.trim()
  }
  throw new Error('No Chrome/Chromium found for PDF generation. Install one, set CHROME_BIN, or set SKIP_PDF=1.')
}

/**
 * Print `url` to the PDF file `out`. Runs Chrome asynchronously, so a
 * server in this same Node process keeps answering Chrome's requests.
 */
export async function printToPdf({ url, out, chrome = findChrome() }) {
  // a throw-away profile, so a Chrome that is already running is not reused
  const profile = mkdtempSync(join(tmpdir(), 'resume-pdf-'))
  try {
    const stderr = await new Promise((done) => {
      execFile(chrome, [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--no-first-run',
        `--user-data-dir=${profile}`,
        '--hide-scrollbars',
        '--no-pdf-header-footer',
        '--blink-settings=preferredColorScheme=1', // light theme
        '--virtual-time-budget=8000',              // let Vue render first
        `--print-to-pdf=${out}`,
        url,
      ], { timeout: 120_000 }, (error, stdout, err) => done(err))
    })
    if (!existsSync(out) || statSync(out).size < 10_000) {
      throw new Error(`PDF generation failed for ${url}\n${stderr}`)
    }
    return out
  } finally {
    rmSync(profile, { recursive: true, force: true })
  }
}
