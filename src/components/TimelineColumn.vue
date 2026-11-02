<script setup>
import BaseIcon from './BaseIcon.vue'
import TimelineItem from './TimelineItem.vue'

defineProps({
  timeline: { type: Object, required: true }, // { title, icon, accent, items }
  locale: { type: String, default: 'en-GB' },
  labels: { type: Object, required: true },
  showOlder: { type: Boolean, default: false }, // reveal entries marked `older`
})
</script>

<template>
  <div class="timeline-col" :style="timeline.accent ? { '--accent': `var(--${timeline.accent})` } : null">
    <h3 v-reveal class="timeline-title">
      <BaseIcon v-if="timeline.icon" :name="timeline.icon" />
      {{ timeline.title }}
    </h3>
    <ol class="timeline">
      <TimelineItem
        v-for="(item, i) in timeline.items"
        :key="i"
        :item="item"
        :locale="locale"
        :labels="labels"
        :class="{ 'older-hidden': item.older && !showOlder }"
      />
    </ol>
  </div>
</template>

<style scoped>
.timeline-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--accent);
  font-size: 1.1rem;
}

.timeline-title .icon {
  font-size: 20px;
  color: var(--accent);
}

.timeline {
  position: relative;
  padding-left: 32px;
}

/* the vertical line */
.timeline::before {
  content: "";
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 7px;
  width: 2px;
  background: linear-gradient(var(--accent), var(--border) 85%, transparent);
}

/* hidden on screen until "Go further into the past"; always printed */
.older-hidden { display: none; }

@media print {
  .older-hidden { display: block; }
  .timeline-title { margin-bottom: 10px; padding-bottom: 6px; font-size: 1rem; break-after: avoid; }
  .timeline { padding-left: 29px; }
  .timeline::before { left: 5px; }
}
</style>
