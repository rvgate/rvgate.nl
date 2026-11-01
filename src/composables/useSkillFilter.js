import { computed, ref } from 'vue'

// Shared filter state. Either one skill is selected (clicked on the mood
// board or in an experience card), or a whole category (clicked in the
// legend), or nothing.
const selected = ref(null)  // skill name
const category = ref(null)  // { key, label, skills: [skill names] }

const norm = (s) => String(s).trim().toLowerCase()

/** True when a list of tags contains the given skill (case-insensitive). */
export function hasSkill(tags, skill) {
  if (!skill || !tags) return false
  const s = norm(skill)
  return tags.some((t) => norm(t) === s)
}

/** Does a single tag match the current filter? */
function matchesTag(tag) {
  if (selected.value) return hasSkill([tag], selected.value)
  if (category.value) return hasSkill(category.value.skills, tag)
  return false
}

/** Does any tag in a list match the current filter? */
function matchesTags(tags) {
  return !!tags && tags.some(matchesTag)
}

export function useSkillFilter() {
  return {
    selected,
    category,
    active: computed(() => selected.value !== null || category.value !== null),
    /** what is being highlighted: the skill name or the category label */
    label: computed(() => selected.value ?? category.value?.label ?? null),
    toggle(skill) {
      category.value = null
      selected.value = hasSkill([skill], selected.value) ? null : skill
    },
    toggleCategory(key, label, skills) {
      selected.value = null
      category.value = category.value?.key === key ? null : { key, label, skills }
    },
    clear() {
      selected.value = null
      category.value = null
    },
    matchesTag,
    matchesTags,
    hasSkill,
  }
}
