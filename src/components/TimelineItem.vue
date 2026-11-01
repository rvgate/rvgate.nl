<script setup>
import { computed } from 'vue'
import TagList from './TagList.vue'
import BaseIcon from './BaseIcon.vue'
import { formatDuration, formatMonth } from '../utils/dates.js'
import { useSkillFilter } from '../composables/useSkillFilter.js'

const props = defineProps({
  item: { type: Object, required: true },
  locale: { type: String, default: 'en-GB' },
  labels: { type: Object, required: true },
})

const { active, matchesTags } = useSkillFilter()
const match = computed(() => active.value && matchesTags(props.item.tags))
const dimmed = computed(() => active.value && !match.value)

const current = computed(() => !props.item.to)
const from = computed(() => formatMonth(props.item.from, props.locale))
const to = computed(() => (current.value ? props.labels.present : formatMonth(props.item.to, props.locale)))
const duration = computed(() => formatDuration(props.item.from, props.item.to, props.labels))
const isExternal = (url) => /^https?:/.test(url)
</script>

<template>
  <li v-reveal class="job" :class="{ current, match, dimmed }">
    <div class="job-dates">
      <time :datetime="item.from">{{ from }}</time> –
      <time :datetime="item.to || undefined">{{ to }}</time>
      <span v-if="duration" class="duration">{{ duration }}</span>
    </div>
    <div class="job-card">
      <h3>{{ item.title }}</h3>
      <p v-if="item.company || item.location" class="company">
        <a
          v-if="item.company && item.url"
          :href="item.url"
          :target="isExternal(item.url) ? '_blank' : undefined"
          :rel="isExternal(item.url) ? 'noopener' : undefined"
        >{{ item.company }}</a>
        <template v-else>{{ item.company }}</template>
        <template v-if="item.company && item.location"> · </template>
        {{ item.location }}
      </p>
      <p v-if="item.description">{{ item.description }}</p>
      <ul v-if="item.highlights?.length" class="highlights">
        <li v-for="(h, i) in item.highlights" :key="i">{{ h }}</li>
      </ul>
      <TagList :tags="item.tags" highlight selectable />
      <ul v-if="item.links?.length" class="links">
        <li v-for="link in item.links" :key="link.url">
          <a
            :href="link.url"
            :target="isExternal(link.url) ? '_blank' : undefined"
            :rel="isExternal(link.url) ? 'noopener' : undefined"
          >
            <BaseIcon :name="link.icon || 'link'" />
            {{ link.label }}
            <span v-if="isExternal(link.url)" class="arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>
    </div>
  </li>
</template>

<style scoped>
.job {
  position: relative;
  padding-bottom: 40px;
}

.job:last-child { padding-bottom: 0; }

/* the dot on the line */
.job::before {
  content: "";
  position: absolute;
  top: 6px;
  left: -32px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg);
  border: 3px solid var(--accent);
}

.job.current::before {
  background: var(--accent);
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 18%, transparent);
  animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
  50% { box-shadow: 0 0 0 10px color-mix(in srgb, var(--accent) 5%, transparent); }
}

.job-dates {
  margin-bottom: 10px;
  font-size: .9rem;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.duration {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--bg-hover);
  color: var(--muted);
  font-size: .8rem;
  font-weight: 500;
}

.job-card {
  padding: 24px 28px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-raised);
  transition: border-color .2s, transform .2s, background .2s;
}

.job-card:hover {
  border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
  background: var(--bg-hover);
  transform: translateX(4px);
}

h3 {
  margin: 0;
  font-size: 1.25rem;
}

p { margin-top: 0; }

.company {
  margin: 2px 0 12px;
  color: var(--muted);
  font-weight: 500;
}

.company a {
  color: var(--text);
  text-decoration: none;
  border-bottom: 1px dashed color-mix(in srgb, var(--accent) 60%, transparent);
  transition: color .2s, border-color .2s;
}

.company a:hover {
  color: var(--accent);
  border-bottom-style: solid;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.links a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--border));
  border-radius: 999px;
  color: var(--accent);
  font-size: .85rem;
  font-weight: 600;
  text-decoration: none;
  transition: background .2s, color .2s, border-color .2s;
}

.links a:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.links .icon { font-size: 15px; }

.links .arrow {
  font-size: .8em;
  opacity: .7;
  transition: transform .2s;
}

.links a:hover .arrow { transform: translate(2px, -2px); }

.highlights li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 4px;
}

.highlights li::before {
  content: "▹";
  position: absolute;
  left: 0;
  color: var(--accent);
}

/* skill filter (click a skill on the mood board) */
.job { transition: opacity .3s; }

.job.dimmed { opacity: .35; }
.job.dimmed:hover { opacity: .8; }

.job.match .job-card {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 7%, var(--bg-raised));
  box-shadow:
    0 0 0 1px var(--accent),
    0 10px 32px color-mix(in srgb, var(--accent) 22%, transparent);
}

.job.match::before {
  background: var(--accent);
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 25%, transparent);
}

@media (max-width: 600px) {
  .job-card { padding: 20px; }
  .job-card:hover { transform: none; }
}

@media print {
  /* long cards may continue on the next page, but never split a line item */
  .job { break-inside: auto; padding-bottom: 16px; opacity: 1 !important; }
  .job-dates, h3, .company { break-after: avoid; }
  .highlights li, .tag-list, .links { break-inside: avoid; }
  .job { padding-bottom: 10px; }
  .job::before { top: 3px; width: 13px; height: 13px; left: -29px; }
  .job-dates { margin-bottom: 4px; font-size: .8rem; }
  .job-card { padding: 10px 14px; }
  .job-card:hover { transform: none; }
  h3 { font-size: 1.05rem; }
  .company { margin: 0 0 6px; font-size: .9rem; }
  p { margin-bottom: 6px; }
  .highlights { margin: 0 0 4px; }
  .highlights li { margin-bottom: 1px; }
  .links { margin-top: 8px; padding-top: 8px; gap: 6px; }
  .links a { padding: 2px 10px; font-size: .75rem; }
  .job.current::before { animation: none; box-shadow: none; }
}
</style>
