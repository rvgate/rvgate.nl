<script setup>
import BaseIcon from './BaseIcon.vue'

defineProps({
  service: { type: Object, required: true }, // { icon, title, description, color }
  color: { type: String, default: 'blue' },
})
</script>

<template>
  <li v-reveal class="card service" :style="{ '--c': `var(--${service.color || color})` }">
    <span class="service-icon"><BaseIcon :name="service.icon" /></span>
    <h3>{{ service.title }}</h3>
    <p v-if="service.description">{{ service.description }}</p>
  </li>
</template>

<style scoped>
.service-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
  border-radius: 12px;
  font-size: 24px;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 14%, transparent);
}

@media print {
  .service { break-inside: avoid; }
  .service-icon { width: 30px; height: 30px; margin-bottom: 6px; font-size: 17px; border-radius: 8px; }
}
</style>
