<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import TimelineColumn from './TimelineColumn.vue'
import BaseIcon from './BaseIcon.vue'
import { useSkillFilter } from '../composables/useSkillFilter.js'
import { useLanguage } from '../composables/useLanguage.js'
import { confetti } from '../utils/confetti.js'
import { chime } from '../utils/chime.js'

const props = defineProps({
  timelines: { type: Array, required: true },
  locale: { type: String, default: 'en-GB' },
  labels: { type: Object, required: true },
  effects: { type: Object, default: () => ({}) }, // { confetti, sound }
})

const { label, active, clear, matchesTags } = useSkillFilter()
const { t } = useLanguage()
const chip = ref(null)

// entries marked `older` stay hidden until the visitor asks for them
const showOlder = ref(false)
const olderItems = computed(() => props.timelines.flatMap((tl) => tl.items.filter((item) => item.older)))

// a highlighted skill used in an older entry should not stay hidden
watch(label, (current) => {
  if (current && olderItems.value.some((item) => matchesTags(item.tags))) showOlder.value = true
})

// celebrate every time a skill or category gets selected
watch(label, async (current) => {
  if (!current) return
  if (props.effects.sound) chime()
  if (!props.effects.confetti) return
  await nextTick()
  const rect = chip.value?.getBoundingClientRect()
  if (rect) confetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
})
</script>

<template>
  <Transition name="chip">
    <div v-if="active" ref="chip" class="filter-chip no-print">
      {{ t('highlighting') }} <strong>{{ label }}</strong>
      <button type="button" :aria-label="t('clearHighlight')" @click="clear">✕</button>
    </div>
  </Transition>

  <div class="timelines" :class="{ single: timelines.length === 1 }">
    <TimelineColumn
      v-for="(timeline, i) in timelines"
      :key="i"
      :timeline="timeline"
      :locale="locale"
      :labels="labels"
      :show-older="showOlder"
    />
  </div>

  <div v-if="olderItems.length" class="older-toggle no-print">
    <button type="button" :aria-expanded="showOlder" @click="showOlder = !showOlder">
      <BaseIcon name="history" />
      {{ showOlder ? t('hideOlder') : t('showOlder') }}
      <span class="arrow" :class="{ up: showOlder }">↓</span>
    </button>
  </div>
</template>

<style scoped>
/* floating chip (bottom centre) showing the active skill filter */
.filter-chip {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 16px;
  border: 1px solid var(--accent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-raised) 85%, transparent);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px var(--shadow);
  font-size: .9rem;
  color: var(--muted);
}

.filter-chip strong { color: var(--text); }

.filter-chip button {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--bg-hover);
  color: var(--text);
  font-size: .75rem;
  cursor: pointer;
}

.filter-chip button:hover { background: var(--accent); color: var(--bg); }

.chip-enter-active, .chip-leave-active { transition: opacity .2s, transform .2s; }
.chip-enter-from, .chip-leave-to { opacity: 0; transform: translate(-50%, 8px); }

/* "Go further into the past" button below the timelines */
.older-toggle {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.older-toggle button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border: 1px dashed color-mix(in srgb, var(--accent) 60%, var(--border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-raised) 85%, transparent);
  color: var(--text);
  font: inherit;
  font-size: .95rem;
  cursor: pointer;
  transition: border-color .2s, background .2s, transform .2s;
}

.older-toggle button:hover {
  border-style: solid;
  border-color: var(--accent);
  background: var(--bg-hover);
  transform: translateY(-2px);
}

.older-toggle .icon { color: var(--accent); }
.older-toggle .arrow { transition: transform .3s; }
.older-toggle .arrow.up { transform: rotate(180deg); }

/* The columns break out a little wider than the other sections,
   while the section title stays aligned with the rest of the page. */
.timelines {
  --tl-width: min(1072px, calc(100vw - 48px));
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  grid-auto-flow: column;
  gap: 48px;
  align-items: start;
  width: var(--tl-width);
  margin-left: calc(50% - var(--tl-width) / 2);
}

/* a single timeline simply uses the normal width */
.timelines.single {
  width: auto;
  margin-left: 0;
}

@media (max-width: 860px) {
  .timelines {
    grid-auto-flow: row;
    grid-template-columns: 1fr;
    gap: 56px;
    width: auto;
    margin-left: 0;
  }
}

@media print {
  .timelines {
    grid-auto-flow: row;
    grid-template-columns: 1fr;
    gap: 16px;
    width: auto;
    margin-left: 0;
  }
}
</style>
