<script setup>
import BaseIcon from './BaseIcon.vue'
import { useTheme } from '../composables/useTheme.js'
import { useLanguage } from '../composables/useLanguage.js'

const { theme, toggleTheme } = useTheme()
const { t } = useLanguage()
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="theme === 'dark' ? t('toLight') : t('toDark')"
    :title="t('themeTitle')"
    @click="toggleTheme"
  >
    <BaseIcon :name="theme === 'dark' ? 'sun' : 'moon'" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: color-mix(in srgb, var(--bg-raised) 80%, transparent);
  backdrop-filter: blur(8px);
  color: var(--text);
  font-size: 20px;
  cursor: pointer;
  transition: border-color .2s, transform .2s, background .3s;
}

.theme-toggle:hover {
  border-color: var(--accent);
  transform: rotate(15deg);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
</style>
