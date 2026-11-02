<script setup>
import BaseIcon from './BaseIcon.vue'
import { useGame } from '../composables/useGame.js'
import { useLanguage } from '../composables/useLanguage.js'

const { playing, startGame } = useGame()
const { t } = useLanguage()
</script>

<template>
  <button
    class="game-button"
    type="button"
    :aria-label="t('gameStart')"
    :title="t('gameStart')"
    :disabled="playing"
    @click="startGame"
  >
    <BaseIcon name="gamepad" />
  </button>
</template>

<style scoped>
.game-button {
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
  transition: border-color .2s, transform .2s, background .3s, color .2s;
}

.game-button:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: scale(1.08) rotate(-8deg);
}

.game-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
</style>
