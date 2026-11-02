<script setup>
/*
 * Animated "network" background: drifting nodes that connect when close,
 * with data packets travelling along the links. Theme-aware, pauses when
 * the tab is hidden, and renders a single static frame for visitors who
 * prefer reduced motion.
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTheme } from '../composables/useTheme.js'
import { onMessageNode } from '../composables/useNetwork.js'

const props = defineProps({
  linkDistance: { type: Number, default: 150 },     // px: max length of a link
  mouseDistance: { type: Number, default: 200 },    // px: range at which nodes reach for the cursor
  density: { type: Number, default: 1 / 14000 },    // nodes per px² of viewport
  maxNodes: { type: Number, default: 110 },
  maxPackets: { type: Number, default: 14 },
})

const canvas = ref(null)
const { theme } = useTheme()

let ctx
let width = 0
let height = 0
let nodes = []
let packets = []
let colors = {}
let running = false
let lastTime = 0
let rafId = 0
let resizeTimer = 0
let offMessage = null
const MAX_MESSAGES = 6 // sent contact-form messages that stay in the network
const mouse = { x: -9999, y: -9999 }
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

function readColors() {
  const cs = getComputedStyle(document.documentElement)
  colors = {
    node: cs.getPropertyValue('--blue').trim() || '#7c9cff',
    packet: cs.getPropertyValue('--teal').trim() || '#4fd1c5',
    alpha: theme.value === 'light' ? 0.55 : 0.45,
  }
}

function makeNode() {
  const speed = 0.08 + Math.random() * 0.17 // px per frame at 60fps
  const angle = Math.random() * Math.PI * 2
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 1 + Math.random() * 1.6,
    hub: Math.random() < 0.08, // a few larger nodes with a ring
  }
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = Math.round(width * dpr)
  canvas.value.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const target = Math.min(props.maxNodes, Math.round(width * height * props.density))
  while (nodes.length < target) nodes.push(makeNode())
  nodes.length = target
  for (const n of nodes) {
    if (n.x > width) n.x = Math.random() * width
    if (n.y > height) n.y = Math.random() * height
  }
  packets = []
  if (!running) draw()
}

function spawnPacket(a = nodes[(Math.random() * nodes.length) | 0]) {
  const max = props.linkDistance ** 2 * (a.message ? 1.6 : 0.6)
  const candidates = nodes.filter((b) => b !== a && (a.x - b.x) ** 2 + (a.y - b.y) ** 2 < max)
  if (!candidates.length) return
  packets.push({
    from: a,
    to: candidates[(Math.random() * candidates.length) | 0],
    t: 0,
    speed: 0.008 + Math.random() * 0.012,
  })
}

/** A sent message joins the network: a pulsing node that links up with its neighbours. */
function addMessage(x, y) {
  const angle = Math.random() * Math.PI * 2
  nodes.unshift({
    x, y,
    vx: Math.cos(angle) * 0.05,
    vy: Math.sin(angle) * 0.05,
    r: 2.6,
    hub: true,
    message: true,
    born: performance.now(),
  })
  // only keep the newest few message nodes
  let seen = 0
  nodes = nodes.filter((n) => !n.message || ++seen <= MAX_MESSAGES)
  if (!running) draw()
}

function update(step) {
  for (const n of nodes) {
    n.x += n.vx * step
    n.y += n.vy * step
    // wrap around the edges with a small margin
    if (n.x < -20) n.x = width + 20; else if (n.x > width + 20) n.x = -20
    if (n.y < -20) n.y = height + 20; else if (n.y > height + 20) n.y = -20
  }

  if (packets.length < props.maxPackets && Math.random() < 0.06 * step) spawnPacket()

  // a freshly arrived message sends a burst of packets to its new neighbours
  const now = performance.now()
  for (const n of nodes) {
    if (n.message && now - n.born > 500 && now - n.born < 4000 && Math.random() < 0.12 * step) spawnPacket(n)
  }

  const max = props.linkDistance ** 2
  packets = packets.filter((pk) => {
    pk.t += pk.speed * step
    // drop packets that arrived or whose link broke
    const reach = pk.from.message || pk.to.message ? max * 1.7 : max
    return pk.t < 1 && (pk.from.x - pk.to.x) ** 2 + (pk.from.y - pk.to.y) ** 2 <= reach
  })
}

function draw() {
  const L = props.linkDistance
  const M = props.mouseDistance
  ctx.clearRect(0, 0, width, height)
  ctx.lineWidth = 1

  // links between nearby nodes, and to the mouse
  ctx.strokeStyle = colors.node
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]
      if (a.message || b.message) continue // drawn by drawMessages()
      const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2
      if (d2 > L * L) continue
      ctx.globalAlpha = (1 - Math.sqrt(d2) / L) * 0.35 * colors.alpha
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }

    const m2 = (a.x - mouse.x) ** 2 + (a.y - mouse.y) ** 2
    if (m2 < M * M) {
      ctx.globalAlpha = (1 - Math.sqrt(m2) / M) * 0.7 * colors.alpha
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(mouse.x, mouse.y)
      ctx.stroke()
    }
  }

  // nodes
  ctx.fillStyle = colors.node
  for (const n of nodes) {
    if (n.message) continue
    ctx.globalAlpha = (n.hub ? 1 : 0.7) * colors.alpha * 1.4
    ctx.beginPath()
    ctx.arc(n.x, n.y, n.hub ? n.r + 1.2 : n.r, 0, Math.PI * 2)
    ctx.fill()
    if (n.hub) {
      ctx.globalAlpha = 0.5 * colors.alpha
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // data packets with a short glowing tail
  ctx.fillStyle = colors.packet
  for (const pk of packets) {
    for (let s = 0; s < 4; s++) {
      const t = Math.max(0, pk.t - s * 0.04)
      ctx.globalAlpha = (1 - s / 4) * colors.alpha * 1.8
      ctx.beginPath()
      ctx.arc(
        pk.from.x + (pk.to.x - pk.from.x) * t,
        pk.from.y + (pk.to.y - pk.from.y) * t,
        2.2 - s * 0.4, 0, Math.PI * 2,
      )
      ctx.fill()
    }
  }

  drawMessages()
  ctx.globalAlpha = 1
}

/** Message nodes: links that grow towards the neighbours, a pulse and a glow. */
function drawMessages() {
  const now = performance.now()
  const reach = props.linkDistance * 1.3
  ctx.strokeStyle = colors.packet
  ctx.fillStyle = colors.packet

  for (const m of nodes) {
    if (!m.message) continue
    const age = now - m.born

    // links, nearest neighbours connect first
    ctx.lineWidth = 1.2
    for (const b of nodes) {
      if (b === m) continue
      const d = Math.hypot(b.x - m.x, b.y - m.y)
      if (d > reach) continue
      const grow = Math.min(1, Math.max(0, (age - 150 - d * 3) / 450))
      if (!grow) continue
      ctx.globalAlpha = (1 - d / reach) * colors.alpha * 1.1
      ctx.beginPath()
      ctx.moveTo(m.x, m.y)
      ctx.lineTo(m.x + (b.x - m.x) * grow, m.y + (b.y - m.y) * grow)
      ctx.stroke()
    }

    // shock wave on arrival
    if (age < 1200) {
      const p = age / 1200
      ctx.lineWidth = 2
      ctx.globalAlpha = (1 - p) * colors.alpha * 2
      ctx.beginPath()
      ctx.arc(m.x, m.y, 4 + p * 80, 0, Math.PI * 2)
      ctx.stroke()
    }

    // steady heartbeat pulse
    const phase = (age % 2400) / 2400
    ctx.lineWidth = 1.2
    ctx.globalAlpha = (1 - phase) * colors.alpha * 1.6
    ctx.beginPath()
    ctx.arc(m.x, m.y, m.r + 3 + phase * 22, 0, Math.PI * 2)
    ctx.stroke()

    // glowing core
    ctx.globalAlpha = colors.alpha * 0.35
    ctx.beginPath()
    ctx.arc(m.x, m.y, m.r + 4 + Math.sin(age / 380) * 1.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = Math.min(1, colors.alpha * 2.2)
    ctx.beginPath()
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.lineWidth = 1
}

function frame(now) {
  if (!running) return
  // normalise movement to 60fps so speed is the same on 120Hz screens
  const step = lastTime ? Math.min((now - lastTime) / 16.67, 3) : 1
  lastTime = now
  update(step)
  draw()
  rafId = requestAnimationFrame(frame)
}

function start() {
  if (running || reducedMotion.matches || document.hidden) return
  running = true
  lastTime = 0
  rafId = requestAnimationFrame(frame)
}

function stop() {
  running = false
  cancelAnimationFrame(rafId)
}

// --- event handlers ---

function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(resize, 150)
}

function onPointerMove(e) {
  if (e.pointerType !== 'mouse') return
  mouse.x = e.clientX
  mouse.y = e.clientY
}

function onPointerLeave() {
  mouse.x = mouse.y = -9999
}

function onVisibility() {
  if (document.hidden) stop(); else start()
}

function onReducedMotion() {
  if (reducedMotion.matches) { stop(); draw() } else start()
}

// re-read colours after the theme's CSS variables are applied
watch(theme, async () => {
  await nextTick()
  requestAnimationFrame(() => {
    readColors()
    if (!running) draw()
  })
})

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  readColors()
  resize()
  start()
  offMessage = onMessageNode(addMessage)

  window.addEventListener('resize', onResize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerleave', onPointerLeave)
  document.addEventListener('visibilitychange', onVisibility)
  reducedMotion.addEventListener?.('change', onReducedMotion)
})

onBeforeUnmount(() => {
  stop()
  clearTimeout(resizeTimer)
  offMessage?.()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerleave', onPointerLeave)
  document.removeEventListener('visibilitychange', onVisibility)
  reducedMotion.removeEventListener?.('change', onReducedMotion)
})
</script>

<template>
  <canvas ref="canvas" class="bg-canvas no-print" aria-hidden="true" />
</template>

<style scoped>
/* The canvas draws the network; the faint grid is pure CSS and fades
   out towards the edges. */
.bg-canvas {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image:
    linear-gradient(color-mix(in srgb, var(--border) 45%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--border) 45%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse at 50% 30%, #000 20%, transparent 80%);
  mask-image: radial-gradient(ellipse at 50% 30%, #000 20%, transparent 80%);
}
</style>
