<script setup>
import { useLanguage } from '../composables/useLanguage.js'

const { lang, languages, setLanguage, t } = useLanguage()
</script>

<template>
  <div class="lang-switch" role="group" :aria-label="t('language')">
    <button
      v-for="(language, code) in languages"
      :key="code"
      type="button"
      :class="{ active: lang === code }"
      :aria-pressed="lang === code"
      :lang="code"
      :title="language.name"
      @click="setLanguage(code)"
    >
      {{ language.label }}
    </button>
  </div>
</template>

<style scoped>
.lang-switch {
  display: flex;
  height: 44px;
  padding: 4px;
  gap: 2px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-raised) 80%, transparent);
  backdrop-filter: blur(8px);
  transition: background .3s, border-color .2s;
}

.lang-switch:hover { border-color: var(--accent); }

button {
  min-width: 40px;
  padding: 0 10px;
  border: none;
  border-radius: 999px;
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .04em;
  cursor: pointer;
  transition: background .2s, color .2s;
}

button:hover { color: var(--text); }

button.active {
  background: var(--accent);
  color: var(--bg);
}

button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
