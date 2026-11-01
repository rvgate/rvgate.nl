<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useSkillFilter } from '../composables/useSkillFilter.js'
import { useLanguage } from '../composables/useLanguage.js'

const props = defineProps({
  skills: { type: Array, required: true },       // [{ name, category, level }]
  categories: { type: Object, required: true },  // { key: { label, color } }
  timelines: { type: Array, default: () => [] }, // to count matching experience entries
  projects: { type: Array, default: () => [] },  // to count matching projects
})

const { selected, category, active, label, toggle, toggleCategory, clear, matchesTag, matchesTags } = useSkillFilter()
const { t } = useLanguage()

const colorVar = (color) => ({ '--c': `var(--${color || 'blue'})` })
const isSelected = (skill) => matchesTag(skill.name)
const isCategorySelected = (key) => category.value?.key === key

function selectCategory(key, cat) {
  const names = props.skills.filter((s) => s.category === key).map((s) => s.name)
  toggleCategory(key, cat.label, names)
}

const roleCount = computed(() =>
  props.timelines.reduce((n, tl) => n + tl.items.filter((item) => matchesTags(item.tags)).length, 0),
)
const projectCount = computed(() => props.projects.filter((p) => matchesTags(p.tags)).length)
const matchCount = computed(() => roleCount.value + projectCount.value)

// "used in 3 roles and 1 project."
const usedInText = computed(() => {
  const parts = []
  if (roleCount.value) parts.push(t('roles', { n: roleCount.value }))
  if (projectCount.value) parts.push(t('projectsCount', { n: projectCount.value }))
  return `${t('usedIn')} ${parts.join(` ${t('and')} `)}.`
})

function onKey(e) {
  if (e.key === 'Escape') clear()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div>
    <ul v-reveal class="legend" :class="{ filtering: category }" :aria-label="t('skillCategories')">
      <li v-for="(cat, key) in categories" :key="key">
        <button
          type="button"
          :class="{ selected: isCategorySelected(key) }"
          :style="colorVar(cat.color)"
          :aria-pressed="isCategorySelected(key)"
          :title="t('highlightSkill', { skill: cat.label })"
          @click="selectCategory(key, cat)"
        >
          {{ cat.label }}
        </button>
      </li>
    </ul>

    <ul v-reveal class="board" :class="{ filtering: active }">
      <li v-for="skill in skills" :key="skill.name">
        <button
          type="button"
          class="tag"
:class="{ selected: isSelected(skill) }"
          :data-level="skill.level || 1"
          :style="colorVar(categories[skill.category]?.color)"
:aria-pressed="isSelected(skill)"
          :title="t('highlightSkill', { skill: skill.name })"
          @click="selected && isSelected(skill) ? clear() : toggle(skill.name)"
        >
          {{ skill.name }}
        </button>
      </li>
    </ul>

    <p class="hint no-print" aria-live="polite">
      <template v-if="active">
        <strong>{{ label }}</strong>
        <template v-if="matchCount">
          — {{ usedInText }}
          <a :href="roleCount ? '#experience' : '#projects'">{{ t('show') }}</a>
        </template>
        <template v-else> — {{ t('noMatches') }}</template>
        <button type="button" class="clear" @click="clear">{{ t('clear') }}</button>
      </template>
      <template v-else>{{ t('skillsHint') }}</template>
    </p>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  margin: 0 0 20px -10px;
  font-size: .85rem;
}

/* categories are buttons: click to highlight the whole category */
.legend button {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: none;
  color: var(--muted);
  font: inherit;
  cursor: pointer;
  transition: color .2s, background .2s, border-color .2s, opacity .2s;
}

.legend button::before {
  content: "";
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 7px;
  border-radius: 50%;
  background: var(--c);
}

.legend button:hover,
.legend button:focus-visible {
  color: var(--text);
  border-color: color-mix(in srgb, var(--c) 45%, transparent);
  background: color-mix(in srgb, var(--c) 10%, transparent);
  outline: none;
}

.legend button.selected {
  color: var(--bg);
  background: var(--c);
  border-color: var(--c);
  font-weight: 600;
}

.legend button.selected::before { background: var(--bg); }

.legend.filtering button:not(.selected) { opacity: .6; }

.board {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-raised);
}

.tag {
  padding: .35em .9em;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
  background: color-mix(in srgb, var(--c) 12%, transparent);
  color: color-mix(in srgb, var(--c) 70%, var(--tag-text-mix));
  font: inherit;
  font-weight: 500;
  line-height: 1.6;
  white-space: nowrap;
  cursor: pointer;
  transition: transform .2s ease, background .2s, box-shadow .2s, opacity .2s;
}

/* slight random-looking tilt for a mood-board feel */
li:nth-child(3n)   .tag { transform: rotate(-2deg); }
li:nth-child(4n+1) .tag { transform: rotate(1.5deg); }
li:nth-child(5n+2) .tag { transform: rotate(-1deg) translateY(3px); }

.tag:hover,
.tag:focus-visible {
  transform: rotate(0) scale(1.08);
  background: color-mix(in srgb, var(--c) 24%, transparent);
  box-shadow: 0 6px 24px color-mix(in srgb, var(--c) 30%, transparent);
  outline: none;
}

.tag[data-level="1"] { font-size: .9rem; }
.tag[data-level="2"] { font-size: 1.1rem; }
.tag[data-level="3"] { font-size: 1.4rem; font-weight: 700; }

/* while a skill is selected, the others step back */
.board.filtering .tag:not(.selected) { opacity: .45; }
.board.filtering .tag:not(.selected):hover { opacity: 1; }

.tag.selected {
  transform: rotate(0) scale(1.1);
  background: var(--c);
  color: var(--bg);
  box-shadow: 0 6px 24px color-mix(in srgb, var(--c) 45%, transparent);
}

.hint {
  min-height: 1.6em;
  margin: 14px 0 0;
  text-align: center;
  font-size: .9rem;
  color: var(--muted);
}

.hint strong { color: var(--text); }

.hint a {
  margin-left: 4px;
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
}

.clear {
  margin-left: 10px;
  padding: 2px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: .8rem;
  cursor: pointer;
}

.clear:hover { color: var(--text); border-color: var(--accent); }

@media (max-width: 600px) {
  .board { padding: 20px; gap: 8px; }
}

@media print {
  .legend { display: none; }
  .board { padding: 12px; gap: 6px; break-inside: avoid; }
  .tag { transform: none !important; opacity: 1 !important; box-shadow: none !important; }
  .tag[data-level="1"] { font-size: .75rem; }
  .tag[data-level="2"] { font-size: .9rem; }
  .tag[data-level="3"] { font-size: 1.05rem; }
}
</style>
