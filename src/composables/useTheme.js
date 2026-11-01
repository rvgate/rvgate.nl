import { computed, ref } from 'vue'

// Shared, module-level state so every component sees the same theme.
const systemQuery = window.matchMedia('(prefers-color-scheme: light)')
const systemLight = ref(systemQuery.matches)
systemQuery.addEventListener?.('change', (e) => { systemLight.value = e.matches })

function readStored() {
  try {
    const t = localStorage.getItem('theme')
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

// null = follow the system setting
const chosen = ref(readStored())

/** The theme in effect: 'dark' or 'light'. */
const theme = computed(() => chosen.value || (systemLight.value ? 'light' : 'dark'))

function toggleTheme() {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  chosen.value = next
  document.documentElement.setAttribute('data-theme', next)
  try { localStorage.setItem('theme', next) } catch { /* private mode */ }
}

export function useTheme() {
  return { theme, toggleTheme }
}
