<script setup>
import { computed } from 'vue'
import TagList from './TagList.vue'
import { useLanguage } from '../composables/useLanguage.js'
import { useSkillFilter } from '../composables/useSkillFilter.js'

const { t } = useLanguage()

const props = defineProps({
  project: { type: Object, required: true }, // { name, year, description, tags, link: { label, url } }
})

// skill filter (click a skill or category): highlight or dim this card
const { active, matchesTags } = useSkillFilter()
const match = computed(() => active.value && matchesTags(props.project.tags))
const dimmed = computed(() => active.value && !match.value)
</script>

<template>
  <li v-reveal class="card project" :class="{ match, dimmed }">
    <div class="card-head">
      <h3>{{ project.name }}</h3>
      <span v-if="project.year" class="year">{{ project.year }}</span>
    </div>
    <p v-if="project.description">{{ project.description }}</p>
    <TagList class="tags" :tags="project.tags" highlight selectable />
    <a
      v-if="project.link?.url"
      class="card-link"
      :href="project.link.url"
      :target="/^https?:/.test(project.link.url) ? '_blank' : undefined"
      rel="noopener"
    >
      {{ project.link.label || t('viewProject') }} <span aria-hidden="true">→</span>
    </a>
  </li>
</template>

<style scoped>
.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.year {
  font-size: .8rem;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

/* skill filter */
.project { transition: opacity .3s, border-color .2s, transform .2s, background .2s, box-shadow .2s; }

.project.dimmed { opacity: .35; }
.project.dimmed:hover { opacity: .8; }

.project.match {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 7%, var(--bg-raised));
  box-shadow:
    0 0 0 1px var(--accent),
    0 10px 32px color-mix(in srgb, var(--accent) 22%, transparent);
}

@media print {
  .project { opacity: 1 !important; }
}

/* push tags + link to the bottom so cards line up */
.tags { margin-top: auto; padding-top: 16px; }

.card-link {
  margin-top: 16px;
  font-size: .9rem;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
}

.card-link span { display: inline-block; transition: transform .2s; }
.card-link:hover span { transform: translateX(4px); }

@media print {
  .tags { padding-top: 8px; }
  .card-link { margin-top: 8px; font-size: .8rem; }
}
</style>
