<script setup>
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  favorites: { type: Object, required: true }, // { intro, items: [{ icon, label, value, color, hidden }] }
})

// colours rotate when an item doesn't set its own
const palette = ['blue', 'teal', 'orange', 'purple', 'pink', 'green']

const items = computed(() =>
  (props.favorites.items || [])
    .filter((item) => !item.hidden)
    .map((item, i) => ({ ...item, color: item.color || palette[i % palette.length] })),
)
</script>

<template>
  <div>
    <p v-if="favorites.intro" v-reveal class="section-lead">{{ favorites.intro }}</p>
    <ul class="favorites">
      <li
        v-for="(item, i) in items"
        :key="i"
        v-reveal
        class="favorite"
        :style="{ '--c': `var(--${item.color})` }"
      >
        <span class="fav-icon"><BaseIcon :name="item.icon" /></span>
        <span class="fav-text">
          <span class="fav-label">{{ item.label }}</span>
          <span class="fav-value">{{ item.value }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.favorites {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.favorite {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-raised);
  transition: border-color .2s, background .2s, transform .2s, box-shadow .2s;
}

.favorite:hover {
  border-color: color-mix(in srgb, var(--c) 55%, var(--border));
  background: color-mix(in srgb, var(--c) 6%, var(--bg-raised));
  transform: translateY(-3px);
  box-shadow: 0 10px 26px color-mix(in srgb, var(--c) 18%, transparent);
}

.fav-icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 22px;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 14%, transparent);
}

/* a little wiggle on hover */
.favorite:hover .fav-icon { animation: wiggle .5s ease; }

@keyframes wiggle {
  25% { transform: rotate(-12deg) scale(1.08); }
  50% { transform: rotate(10deg) scale(1.08); }
  75% { transform: rotate(-5deg); }
}

.fav-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.fav-label {
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--muted);
}

.fav-value {
  font-weight: 600;
  line-height: 1.35;
}

@media print {
  .favorites { grid-template-columns: repeat(4, 1fr); gap: 6px; break-inside: avoid; }
  .favorite { padding: 6px 8px; gap: 8px; break-inside: avoid; }
  .favorite:hover { transform: none; box-shadow: none; }
  .fav-icon { width: 28px; height: 28px; font-size: 15px; border-radius: 8px; }
  .fav-label { font-size: .6rem; }
  .fav-value { font-size: .8rem; }
}
</style>
