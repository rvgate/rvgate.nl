<script setup>
import { useSkillFilter } from '../composables/useSkillFilter.js'
import { useLanguage } from '../composables/useLanguage.js'

defineProps({
  tags: { type: Array, default: () => [] },
  highlight: { type: Boolean, default: false }, // emphasise tags matching the skill/category filter
  selectable: { type: Boolean, default: false }, // clicking a tag toggles the skill filter
})

const { toggle, matchesTag } = useSkillFilter()
const { t } = useLanguage()
const isHit = (tag, highlight) => highlight && matchesTag(tag)
</script>

<template>
  <ul v-if="tags.length" class="tag-list">
    <li v-for="tag in tags" :key="tag">
      <button
        v-if="selectable"
        type="button"
        class="tag"
        :class="{ hit: isHit(tag, highlight) }"
        :aria-pressed="isHit(tag, highlight)"
        :title="t('highlightSkill', { skill: tag })"
        @click="toggle(tag)"
      >{{ tag }}</button>
      <span v-else class="tag" :class="{ hit: isHit(tag, highlight) }">{{ tag }}</span>
    </li>
  </ul>
</template>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
}

.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--muted);
  font: inherit;
  font-size: .8rem;
  line-height: 1.6;
  transition: background .2s, color .2s, border-color .2s, transform .2s;
}

button.tag { cursor: pointer; }

button.tag:hover,
button.tag:focus-visible {
  border-color: var(--accent);
  color: var(--text);
  transform: translateY(-1px);
  outline: none;
}

.tag.hit,
button.tag.hit:hover {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--bg);
  font-weight: 600;
}

@media print {
  .tag-list { gap: 4px; margin-top: 8px; }
  .tag { padding: 0 6px; font-size: .7rem; }
}
</style>
