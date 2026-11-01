<script setup>
import ServiceCard from './ServiceCard.vue'

defineProps({
  services: { type: Object, required: true }, // { intro, items }
})

// colours rotate when a service doesn't set its own
const palette = ['blue', 'teal', 'orange', 'pink', 'purple']
</script>

<template>
  <div>
    <p v-if="services.intro" v-reveal class="section-lead">{{ services.intro }}</p>
    <ul class="cards services">
      <ServiceCard
        v-for="(service, i) in services.items"
        :key="i"
        :service="service"
        :color="palette[i % palette.length]"
      />
    </ul>
  </div>
</template>

<style scoped>
/* 2×2 instead of 3+1 on desktop */
.services { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }

@media (max-width: 600px) {
  .services { grid-template-columns: 1fr; }
}

@media print {
  .services { grid-template-columns: repeat(3, 1fr); }
}
</style>
