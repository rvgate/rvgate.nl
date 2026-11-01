<script setup>
defineProps({
  number: { type: Number, required: true },
  title: { type: String, required: true },
})
</script>

<template>
  <h2 v-reveal class="section-title">
    <span>{{ String(number).padStart(2, '0') }}</span> {{ title }}
  </h2>
</template>

<style scoped>
.section-title {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 0 0 32px;
  font-size: 1.9rem;
  letter-spacing: -.01em;
}

.section-title span {
  font-size: .9rem;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.section-title::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
  transform: translateY(-6px);
}

@media print {
  .section-title { font-size: 1.35rem; margin-bottom: 12px; break-after: avoid; }
  .section-title::after { transform: translateY(-4px); }
}
</style>
