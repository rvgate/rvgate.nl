<script setup>
import BaseIcon from './BaseIcon.vue'

defineProps({
  contact: { type: Object, required: true }, // { intro, items: [{ icon, label, url }] }
})

const isExternal = (url) => /^https?:/.test(url)
</script>

<template>
  <div>
    <p v-if="contact.intro" v-reveal class="section-lead">{{ contact.intro }}</p>
    <ul v-reveal class="contact-list">
      <li v-for="(item, i) in contact.items" :key="i">
        <component
          :is="item.url ? 'a' : 'div'"
          class="contact-item"
          :href="item.url"
          :rel="item.url && isExternal(item.url) ? 'noopener' : undefined"
        >
          <BaseIcon :name="item.icon" />
          {{ item.label }}
        </component>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.contact-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-raised);
  text-decoration: none;
  transition: border-color .2s, background .2s;
}

a.contact-item:hover {
  border-color: var(--accent);
  background: var(--bg-hover);
}

.contact-item .icon {
  font-size: 22px;
  color: var(--accent);
}

@media print {
  .contact-list { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .contact-item { padding: 8px 12px; gap: 10px; }
}
</style>
