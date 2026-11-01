import { computed, ref, watch } from 'vue'
import content from '../content.js'

// Shared, module-level language state.

const codes = Object.keys(content.languages)
const fallback = codes[0]
const isSupported = (code) => codes.includes(code)

function initialLanguage() {
  // 1. ?lang=nl in the URL (handy for sharing a specific language)
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (isSupported(fromUrl)) return fromUrl
  // 2. the visitor's earlier choice
  try {
    const stored = localStorage.getItem('lang')
    if (isSupported(stored)) return stored
  } catch { /* private mode */ }
  // 3. the browser's preferred languages
  for (const l of navigator.languages || [navigator.language]) {
    const code = String(l).slice(0, 2).toLowerCase()
    if (isSupported(code)) return code
  }
  return fallback
}

const lang = ref(initialLanguage())

function setLanguage(code) {
  if (!isSupported(code)) return
  lang.value = code
  try { localStorage.setItem('lang', code) } catch { /* private mode */ }
  // keep an existing ?lang= in the address bar in sync
  const url = new URL(window.location.href)
  if (url.searchParams.has('lang')) {
    url.searchParams.set('lang', code)
    history.replaceState(null, '', url)
  }
}

// keep <html lang>, the tab title and meta description in sync
watch(lang, (code) => {
  document.documentElement.lang = code
  const meta = localize(content.meta, code)
  if (meta?.title) document.title = meta.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', meta?.description || '')
}, { immediate: true })

/** Is `value` a translation object like { en: '…', nl: '…' }? */
function isTranslation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return keys.length > 0 && keys.every(isSupported)
}

/** Resolve every { en, nl } object inside `value` to the given language. */
export function localize(value, code) {
  if (isTranslation(value)) {
    const picked = value[code] ?? value[fallback] ?? Object.values(value)[0]
    return localize(picked, code)
  }
  if (Array.isArray(value)) return value.map((v) => localize(v, code))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localize(v, code)]))
  }
  return value
}

/** The whole content of the site, in the current language. */
const cv = computed(() => localize(content, lang.value))

/**
 * Interface text from `ui` in content.js.
 * t('usedIn', { n: 2 }) picks the plural form and fills in {n}.
 */
function t(key, vars = {}) {
  let text = cv.value.ui?.[key] ?? key
  if (Array.isArray(text)) text = text[vars.n === 1 ? 0 : 1]
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? vars[name] : m))
}

export function useLanguage() {
  return {
    lang,
    languages: content.languages,
    locale: computed(() => content.languages[lang.value]?.locale || 'en-GB'),
    setLanguage,
    cv,
    t,
  }
}
