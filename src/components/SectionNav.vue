<script setup>
/*
 * Section buttons that stick to the top of the screen while scrolling,
 * highlighting the section currently in view ("scroll spy").
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] }, // [{ id, title, primary }]
})

const wrap = ref(null)
const nav = ref(null)
const active = ref(null) // id of the section in view
const stuck = ref(false) // true once the bar sticks to the top

let ticking = false

function update() {
  ticking = false
  if (!wrap.value) return

  // stuck: the bar sits at its sticky offset instead of in the page flow
  const stickyTop = parseFloat(getComputedStyle(wrap.value).top) || 0
  stuck.value = wrap.value.getBoundingClientRect().top <= stickyTop + 1

  // active: the last section whose top has passed ~a third of the screen
  const line = window.innerHeight * 0.35
  let current = null
  for (const item of props.items) {
    const el = document.getElementById(item.id)
    if (el && el.getBoundingClientRect().top <= line) current = item.id
  }
  // at the very bottom, the last section counts as active even if it is short
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
  if (atBottom && props.items.length) current = props.items[props.items.length - 1].id
  active.value = current
}

function onScroll() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(update)
  }
}

// on small screens the bar scrolls sideways: keep the active button visible
watch(active, async (id) => {
  await nextTick()
  const link = id && nav.value?.querySelector(`[data-id="${id}"]`)
  if (!link || nav.value.scrollWidth <= nav.value.clientWidth) return
  nav.value.scrollTo({
    left: link.offsetLeft - (nav.value.clientWidth - link.offsetWidth) / 2,
    behavior: 'smooth',
  })
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div v-if="items.length" ref="wrap" class="section-nav-wrap no-print" :class="{ stuck }">
    <nav ref="nav" class="section-nav">
      <a
        v-for="item in items"
        :key="item.id"
        :data-id="item.id"
        :href="`#${item.id}`"
        :class="{ primary: item.primary, active: active === item.id }"
        :aria-current="active === item.id ? 'true' : undefined"
      >{{ item.title }}</a>
    </nav>
  </div>
</template>

<style scoped>
.section-nav-wrap {
  position: sticky;
  top: 16px;
  z-index: 9;
  display: flex;
  justify-content: center;
  margin: 0 auto 16px;
  padding: 0 16px;
  pointer-events: none; /* only the bar itself is clickable */
}

.section-nav {
  display: flex;
  gap: 8px;
  max-width: 100%;
  padding: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  border: 1px solid transparent;
  border-radius: 999px;
  pointer-events: auto;
  transition: background .3s, border-color .3s, box-shadow .3s;
}

.section-nav::-webkit-scrollbar { display: none; }

/* once stuck: a floating, frosted bar */
.stuck .section-nav {
  background: color-mix(in srgb, var(--bg-raised) 82%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-color: var(--border);
  box-shadow: 0 10px 30px var(--shadow);
}

a {
  flex: none;
  padding: 8px 18px;
  border: 1px solid var(--border);
  border-radius: 999px;
  text-decoration: none;
  font-size: .9rem;
  white-space: nowrap;
  color: var(--muted);
  transition: color .2s, border-color .2s, background .2s;
}

.stuck a:not(.primary):not(.active) { border-color: transparent; }

a:hover {
  color: var(--text);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}

/* the section currently in view */
a.active {
  color: var(--text);
  font-weight: 600;
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}

/* the call-to-action button (primary: true in content.js) */
a.primary {
  border-color: transparent;
  background: linear-gradient(135deg, var(--blue), var(--teal));
  color: var(--bg);
  font-weight: 700;
  box-shadow: 0 6px 20px color-mix(in srgb, var(--blue) 35%, transparent);
  transition: transform .2s, box-shadow .2s, filter .2s;
}

a.primary:hover {
  color: var(--bg);
  transform: translateY(-2px);
  filter: brightness(1.08);
  box-shadow: 0 10px 28px color-mix(in srgb, var(--blue) 50%, transparent);
}

a.primary.active {
  box-shadow:
    0 0 0 2px var(--bg-raised),
    0 0 0 4px var(--teal),
    0 6px 20px color-mix(in srgb, var(--blue) 35%, transparent);
}

a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* narrower screens: sit below the language/theme buttons and scroll sideways */
@media (max-width: 1000px) {
  .section-nav-wrap { top: 72px; }
}

@media (max-width: 600px) {
  .section-nav-wrap { padding: 0 8px; }
  a { padding: 7px 14px; font-size: .85rem; }
}
</style>
