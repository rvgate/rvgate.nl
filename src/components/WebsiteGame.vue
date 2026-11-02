<script setup>
/*
 * "Catch the website": the page dissolves into dots, a spaceship warps in
 * and has to collect every dot to put the website back together.
 *
 *   dissolve → the visible page breaks into dust that swirls into one dot per element
 *   play     → endless: fly around (keys or pointer), catch orbs, shoot the bugs;
 *              a few dozen orbs are out at once and every caught one is replaced
 *              by another piece of the website; every 50 orbs is a new level
 *   lost     → the ship took 5 hits: score panel, try again or give up
 *   restore  → the dust flies back to where it came from and the page fades in
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useGame } from '../composables/useGame.js'
import { useLanguage } from '../composables/useLanguage.js'
import BaseIcon from './BaseIcon.vue'
import { sampleDom } from '../game/sampleDom.js'
import { ICONS, ITEMS, iconPath, randomItem } from '../game/items.js'
import {
  drawBolts, drawBug, drawItem, drawMine, drawPack, drawPulse, drawShieldBubble, drawShots, drawSlime, drawVirus,
} from '../game/sprites.js'
import {
  blip, boom, chime, clunk, fanfare, heal, hurt, nope, pickup, powerUp, whoosh, zap,
} from '../utils/chime.js'
import { confetti } from '../utils/confetti.js'

const { stopGame } = useGame()
const { t } = useLanguage()

const canvas = ref(null)
const phase = ref('dissolve')
const caught = ref(0)
const elapsed = ref(0)          // ms of play time
const best = ref(readBest())            // most orbs collected in one run
const newBest = ref(false)
const hp = ref(5)
const kills = ref(0)
const level = ref(1)
const slots = ref([null, null, null])   // carried items, used with keys 1 – 3
const shieldLeft = ref(0)               // ms, for the HUD
const multiLeft = ref(0)
const magnetLeft = ref(0)
const banner = ref(0)                   // level being announced, 0 = none
const touch = window.matchMedia('(pointer: coarse)').matches
const quick = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const time = computed(() => formatTime(elapsed.value))
// progress within the current level
const levelProgress = computed(() => (caught.value % DOTS_PER_LEVEL) / DOTS_PER_LEVEL)

// --- timings (ms) ---
const FADE = quick ? 0 : 450        // page fades out / in
const WAVE = quick ? 0 : 600        // top-to-bottom stagger of the dissolve
const FLY = quick ? 1 : 950         // duration of one speck's flight
const WARP = quick ? 1 : 700        // ship warp-in
const MAGNET = 150                  // px: dots closer than this get pulled into the ship
const SHY = 90                      // px beyond the magnet where dots try to get away
const SETTLED = WAVE + 160 + FLY    // when the last dot has arrived

// --- combat ---
const MAX_HP = 5
const HEAL = 2               // hit points a health pack restores
const INVULN = 1200          // ms of invulnerability after a hit
const FIRE_RATE = 170        // ms between shots
const FIRST_ENEMY = 3500     // ms of peace at the start
const PACK_TTL = 14000       // ms before a health pack disappears
const PACK_DROP = 0.15       // chance a destroyed enemy drops a health pack
const ITEM_DROP = 0.14       // chance a destroyed enemy drops an item
const ITEM_TTL = 15000       // ms before an item on the field disappears
const DOTS_PER_LEVEL = 50
const ACTIVE_DOTS = 40       // orbs in play at once; the rest of the website waits in reserve
const RESPAWN_DELAY = 1200   // ms before a caught dot is replaced by a new one
const RESPAWN_POP = 450      // ms of the pop-in animation
const PUSH_RADIUS = 360
const MINE_RADIUS = 130      // px blast radius (hurts the ship too!)
const MINE_ARM = 800         // ms before a dropped mine starts hunting
const MINE_SEEK = 280        // px: an armed mine locks on to the nearest enemy within this range
const MINE_SPEED = 7         // px per frame top speed while homing (faster than any enemy)
const MULTISHOT_SPREAD = [-0.26, -0.13, 0, 0.13, 0.26]
const SLIME_TTL = 9000       // ms a green virus's slime stays on the field
const SLIME_GAP = 9          // px a green virus moves between slime blobs
const SLIME_MAX = 600        // blobs on the field at most

let ctx, width, height, dpr
let rafId = 0
let lastTime = 0
let phaseStart = 0
let playStart = 0
let lastHud = 0
let colors = {}
let targets = []
let dust = []
let sparks = []
let labels = []
let stars = []
let combo = 0
let lastCatch = 0
let finishing = false
let enemies = []
let bolts = []      // the ship's shots
let shots = []      // enemy shots
let packs = []
let lastShot = 0
let nextEnemy = 0
let nextPack = 0
let invulnUntil = 0
let hurtAt = -1e9
let shake = 0
let mines = []
let pulses = []     // expanding shock rings
let slime = []      // green virus trails: { x, y, r, born }
let nextItem = 0
let shieldUntil = 0
let multiUntil = 0
let magnetUntil = 0
let flashAt = -1e9
let bannerUntil = 0
let respawns = []   // times at which a new dot comes in
const keys = new Set()
const pointer = { down: false, x: 0, y: 0 }
const ship = {
  x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, thrust: false, scale: 0, dead: false, magnet: MAGNET,
  slimed: false, // inside a slime trail: slower and sluggish
}

// ------------------------------------------------------------ helpers

function readBest() {
  try { return Number(localStorage.getItem('gameBestOrbs')) || 0 } catch { return 0 }
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}.${Math.floor((ms % 1000) / 100)}`
}

const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2)
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const rand = (a, b) => a + Math.random() * (b - a)

function readColors() {
  const cs = getComputedStyle(document.documentElement)
  const v = (name, fb) => cs.getPropertyValue(name).trim() || fb
  colors = {
    accent: v('--accent', '#7c9cff'),
    teal: v('--teal', '#4fd1c5'),
    orange: v('--orange', '#f6ad55'),
    pink: v('--pink', '#f687b3'),
    purple: v('--purple', '#b794f4'),
    green: v('--green', '#68d391'),
    red: '#f2545b',
    lime: '#a3e635',
    text: v('--text', '#e6e8ef'),
    muted: v('--muted', '#8b91a5'),
    font: v('--font', 'system-ui, sans-serif'),
  }
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = Math.round(width * dpr)
  canvas.value.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  for (const tg of targets) {
    tg.x = Math.min(tg.x, width)
    tg.y = Math.min(tg.y, height)
  }
  ship.x = Math.min(ship.x, width)
  ship.y = Math.min(ship.y, height)
}

/** A free spot in the arena, keeping clear of the spawn point in the middle. */
/** Put a random handful of dots in play; the others wait in reserve. */
function pickActive() {
  const order = targets.map((tg, i) => [Math.random(), i]).sort((a, b) => a[0] - b[0])
  order.forEach(([, i], n) => {
    targets[i].active = n < ACTIVE_DOTS
    targets[i].spawnedAt = 0
  })
  respawns = []
}

/** Bring another piece of the website into play, away from the ship. Pieces are reused forever. */
function respawnDot(now) {
  const reserve = targets.filter((tg) => !tg.active)
  if (!reserve.length) return
  const tg = reserve[(Math.random() * reserve.length) | 0]
  let spot = arenaSpot()
  for (let i = 0; i < 15 && Math.hypot(spot.x - ship.x, spot.y - ship.y) < 220; i++) spot = arenaSpot()
  Object.assign(tg, { active: true, caught: false, spawnedAt: now, x: spot.x, y: spot.y, vx: tg.drift.x, vy: tg.drift.y })
}

function arenaSpot() {
  const m = 28
  for (let i = 0; i < 20; i++) {
    const x = rand(m, width - m)
    const y = rand(m + 50, height - m)
    if (Math.hypot(x - width / 2, y - height / 2) > Math.min(170, width / 4)) return { x, y }
  }
  return { x: rand(m, width - m), y: rand(m, height - m) }
}

// ------------------------------------------------------------ setup

function setup() {
  const { targets: tg, dust: ds } = sampleDom(document.getElementById('app'), {
    exclude: ['.top-bar', '.bg-canvas'],
  })

  targets = tg.map((t0) => {
    const spot = arenaSpot()
    const angle = Math.random() * Math.PI * 2
    const speed = rand(0.15, 0.45)
    // off-screen elements stream in from just beyond the top / bottom edge
    const oy = Math.max(-40, Math.min(height + 40, t0.y))
    return {
      ...t0,
      ox: t0.x, oy,
      sx: t0.x, sy: oy,      // where the current flight starts
      tx: spot.x, ty: spot.y,
      x: t0.x, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      drift: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      bob: Math.random() * Math.PI * 2,
      delay: clamp01(oy / height) * WAVE + rand(0, 120),
      caught: false,
    }
  })

  dust = ds.map((d) => ({
    ...d,
    sx: d.ox, sy: d.oy,
    jx: rand(-1, 1) * d.target.r * 1.4,   // lands around its dot, not on one pixel
    jy: rand(-1, 1) * d.target.r * 1.4,
    swirl: rand(-1, 1) * 120,
    delay: clamp01(d.oy / height) * WAVE + rand(0, 160),
  }))
  // fewer fillStyle switches while drawing
  dust.sort((a, b) => (a.target.color < b.target.color ? -1 : 1))

  stars = Array.from({ length: Math.round((width * height) / 9000) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: rand(0.15, 1),
  }))

  pickActive()
  ship.x = width / 2
  ship.y = height / 2
}

// ------------------------------------------------------------ phases

function setPhase(name, now = performance.now()) {
  phase.value = name
  phaseStart = now
}

function startRestore() {
  if (phase.value === 'restore') return
  clearEnemies()
  // every speck flies back from wherever its dot is now (or from the ship if caught)
  for (const d of dust) {
    const tg = d.target
    d.sx = tg.active ? tg.x : ship.x
    d.sy = tg.active ? tg.y : ship.y
    d.delay = clamp01(d.oy / height) * WAVE * 0.6 + rand(0, 140)
  }
  setPhase('restore')
}

function finish() {
  finishing = true
  document.documentElement.classList.remove('game-on')
  setTimeout(stopGame, FADE + 450)
}

/** Start over: scatter the dots again and warp in a fresh ship. */
function retry() {
  for (const tg of targets) {
    const s = arenaSpot()
    Object.assign(tg, { caught: false, x: s.x, y: s.y, sx: s.x, sy: s.y, tx: s.x, ty: s.y })
  }
  pickActive()
  caught.value = 0
  hp.value = MAX_HP
  kills.value = 0
  elapsed.value = 0
  newBest.value = false
  enemies = []
  bolts = []
  shots = []
  packs = []
  labels = []
  mines = []
  pulses = []
  combo = 0
  invulnUntil = 0
  shieldUntil = 0
  multiUntil = 0
  magnetUntil = 0
  ship.magnet = MAGNET
  slime = []
  ship.slimed = false
  level.value = 1
  slots.value = [null, null, null]
  banner.value = 0
  Object.assign(ship, { x: width / 2, y: height / 2, vx: 0, vy: 0, angle: -Math.PI / 2, scale: 0, dead: false })
  // jump straight to the warp-in at the end of the dissolve
  setPhase('dissolve', performance.now() - SETTLED)
}

// ------------------------------------------------------------ update

function catchTarget(tg, now) {
  tg.caught = true
  tg.active = false
  caught.value++
  respawns.push(now + RESPAWN_DELAY)
  combo = now - lastCatch < 700 ? combo + 1 : 0
  lastCatch = now
  blip({ step: combo })
  burst(tg.x, tg.y, tg.color, 10, 4)
  const next = 1 + Math.floor(caught.value / DOTS_PER_LEVEL)
  if (next > level.value) levelUp(next, now)
}

function updateShip(step, now) {
  // the orb magnet item doubles the pull range; ease in and out of it
  const range = now < magnetUntil ? MAGNET * ITEMS.magnet.boost : MAGNET
  ship.magnet += (range - ship.magnet) * Math.min(1, 0.12 * step)

  const left = keys.has('ArrowLeft') || keys.has('a') || keys.has('q')
  const right = keys.has('ArrowRight') || keys.has('d')
  let thrust = keys.has('ArrowUp') || keys.has('w') || keys.has('z')
  const brake = keys.has('ArrowDown') || keys.has('s')

  if (left) ship.angle -= 0.085 * step
  if (right) ship.angle += 0.085 * step

  // pointer / touch: turn towards the finger and fly there
  if (pointer.down) {
    const dx = pointer.x - ship.x
    const dy = pointer.y - ship.y
    const want = Math.atan2(dy, dx)
    let diff = want - ship.angle
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    ship.angle += Math.max(-0.16, Math.min(0.16, diff)) * step
    thrust = Math.hypot(dx, dy) > 24 && Math.abs(diff) < 1.6
  }

  ship.thrust = thrust
  if (thrust) {
    const power = ship.slimed ? 0.11 : 0.26
    ship.vx += Math.cos(ship.angle) * power * step
    ship.vy += Math.sin(ship.angle) * power * step
    // exhaust
    if (Math.random() < 0.9) {
      const a = ship.angle + Math.PI + rand(-0.35, 0.35)
      sparks.push({
        x: ship.x - Math.cos(ship.angle) * 12, y: ship.y - Math.sin(ship.angle) * 12,
        vx: Math.cos(a) * rand(1.5, 3) + ship.vx * 0.3, vy: Math.sin(a) * rand(1.5, 3) + ship.vy * 0.3,
        life: 0.6, color: Math.random() < 0.5 ? colors.orange : colors.pink, size: rand(1.5, 3),
      })
    }
  }
  const drag = brake ? 0.93 : ship.slimed ? 0.95 : 0.988
  ship.vx *= drag ** step
  ship.vy *= drag ** step
  const sp = Math.hypot(ship.vx, ship.vy)
  const maxSpeed = ship.slimed ? 3.2 : 8
  if (sp > maxSpeed) { ship.vx *= maxSpeed / sp; ship.vy *= maxSpeed / sp }
  // sticky drips
  if (ship.slimed && Math.random() < 0.25 * step) {
    sparks.push({ x: ship.x + rand(-8, 8), y: ship.y + rand(-8, 8), vx: rand(-0.3, 0.3), vy: rand(0.4, 1.2), life: 0.8, color: colors.lime, size: rand(2, 3.5) })
  }

  ship.x += ship.vx * step
  ship.y += ship.vy * step
  if (ship.x < -15) ship.x = width + 15; else if (ship.x > width + 15) ship.x = -15
  if (ship.y < -15) ship.y = height + 15; else if (ship.y > height + 15) ship.y = -15

  // the dots: drift, shy away from the ship, but get pulled in when it's close
  for (const tg of targets) {
    if (!tg.active) continue
    const dx = tg.x - ship.x
    const dy = tg.y - ship.y
    const d = Math.hypot(dx, dy) || 1
    const reach = 16 + tg.r
    if (d < reach) { catchTarget(tg, now); continue }
    const pull = reach + ship.magnet
    if (d < pull) {
      // stronger the closer it gets
      const f = (0.5 + 0.7 * (1 - d / pull)) * step
      tg.vx -= (dx / d) * f
      tg.vy -= (dy / d) * f
    } else if (d < pull + SHY) {
      const f = (1 - (d - pull) / SHY) * 0.07 * step
      tg.vx += (dx / d) * f
      tg.vy += (dy / d) * f
    }
    // ease back towards the calm drift
    tg.vx += (tg.drift.x - tg.vx) * 0.02 * step
    tg.vy += (tg.drift.y - tg.vy) * 0.02 * step
    const s = Math.hypot(tg.vx, tg.vy)
    const max = d < pull ? 10 : 2.8
    if (s > max) { tg.vx *= max / s; tg.vy *= max / s }
    tg.bob += 0.04 * step
    tg.x += tg.vx * step
    tg.y += tg.vy * step + Math.sin(tg.bob) * 0.15
    if (tg.x < -10) tg.x = width + 10; else if (tg.x > width + 10) tg.x = -10
    if (tg.y < -10) tg.y = height + 10; else if (tg.y > height + 10) tg.y = -10
  }

  while (respawns.length && respawns[0] <= now) {
    respawns.shift()
    respawnDot(now)
  }
}

/** Floating text; stacks above other fresh labels at the same spot instead of overlapping. */
function addLabel(x, y, text, color, life = 1) {
  const crowd = labels.filter((l) => l.life > 0.6 && Math.abs(l.x - x) < 60 && Math.abs(l.y - y) < 40).length
  labels.push({ x, y: y - crowd * 16, text, life, color })
}

function updateEffects(step) {
  sparks = sparks.filter((p) => {
    p.x += p.vx * step
    p.y += p.vy * step
    p.vx *= 0.95 ** step
    p.vy *= 0.95 ** step
    p.life -= 0.03 * step
    return p.life > 0
  })
  labels = labels.filter((l) => {
    l.y -= 0.6 * step
    l.life -= 0.014 * step
    return l.life > 0
  })
  // stars drift opposite to the ship for a bit of depth
  for (const s of stars) {
    s.x -= ship.vx * s.z * 0.25 * step
    s.y -= (ship.vy * s.z * 0.25 - s.z * 0.08) * step
    if (s.x < 0) s.x += width; else if (s.x > width) s.x -= width
    if (s.y < 0) s.y += height; else if (s.y > height) s.y -= height
  }
}

// ------------------------------------------------------------ combat

function burst(x, y, color, n = 10, power = 4) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const sp = rand(0.6, power)
    sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color, size: rand(1.5, 3.5) })
  }
}

const enemyColor = (e) => ({ bug: colors.red, virus: colors.purple, toxic: colors.lime })[e.type]

/** Pop every enemy and projectile (on winning or quitting). */
function clearEnemies() {
  for (const e of enemies) burst(e.x, e.y, enemyColor(e), 14, 5)
  if (enemies.length) boom()
  enemies = []
  shots = []
  bolts = []
  mines = []
  slime = []
}

/** How hard the current level is. */
function difficulty() {
  const L = level.value
  return {
    maxEnemies: Math.min(16, 2 + L * 2),
    spawnEvery: Math.max(650, 3800 - L * 550),
    virusChance: Math.min(0.6, 0.15 + L * 0.1),
    toxicChance: Math.min(0.25, 0.08 + (L - 1) * 0.03),
    bugSpeed: 1.5 + L * 0.25,
    bugHp: L >= 4 ? 3 : 2,
    virusHp: L >= 3 ? 4 : 3,
    fireEvery: Math.max(900, 2700 - L * 300),
  }
}

function levelUp(L, now) {
  level.value = L
  banner.value = L
  bannerUntil = now + 2400
  fanfare()
  addLabel(ship.x, ship.y - 30, t('gameLevel', { n: L }), colors.accent, 1.4)
  // a reward to help with what's coming…
  const a = Math.random() * Math.PI * 2
  spawnPack(ship.x + Math.cos(a) * 90, ship.y + Math.sin(a) * 90, now, randomItem())
  // …and a wave of bugs right away
  for (let i = 0; i < L; i++) spawnEnemy(now)
  nextEnemy = now + difficulty().spawnEvery
}

function spawnEnemy(now) {
  const dif = difficulty()
  let x = 0
  let y = 0
  // just outside a random edge, not right next to the ship
  for (let i = 0; i < 10; i++) {
    const side = (Math.random() * 4) | 0
    x = side === 0 ? -30 : side === 1 ? width + 30 : rand(0, width)
    y = side === 2 ? -30 : side === 3 ? height + 30 : rand(0, height)
    if (Math.hypot(x - ship.x, y - ship.y) > 260) break
  }
  const base = { x, y, vx: 0, vy: 0, angle: 0, look: 0, flash: 0, phase: rand(0, 6), dead: false }
  const roll = Math.random()
  if (roll < dif.toxicChance) {
    // green virus: slow and tough, leaves a trail of toxic slime
    enemies.push({ ...base, type: 'toxic', r: 15, hp: 5 + Math.floor(level.value / 3), speed: rand(0.45, 0.6) + level.value * 0.03, trail: 0 })
  } else if (roll < dif.toxicChance + dif.virusChance) {
    // virus: keeps its distance and shoots
    enemies.push({ ...base, type: 'virus', r: 12, hp: dif.virusHp, speed: rand(0.9, 1.3), nextShot: now + rand(1200, 2000) })
  } else {
    // bug: rams the ship
    enemies.push({ ...base, type: 'bug', r: 10, hp: dif.bugHp, speed: dif.bugSpeed + rand(0, 0.6) })
  }
}

/** Put a pickup on the field: a health pack, or an item kind from ITEMS. */
function spawnPack(x, y, now, kind = 'health') {
  if (packs.length >= 6) return
  packs.push({ kind, x, y, vx: 0, vy: 0, born: now, ttl: kind === 'health' ? PACK_TTL : ITEM_TTL, taken: false })
}

function killEnemy(e, now, drops = true) {
  if (e.dead) return
  e.dead = true
  kills.value++
  boom()
  burst(e.x, e.y, enemyColor(e), 18, 5)
  if (!drops) return
  const roll = Math.random()
  if (roll < PACK_DROP) spawnPack(e.x, e.y, now)
  else if (roll < PACK_DROP + ITEM_DROP) spawnPack(e.x, e.y, now, randomItem())
}

function hurtShip(now) {
  if (ship.dead || now < invulnUntil) return
  if (now < shieldUntil) {
    // the shield soaks it up
    burst(ship.x, ship.y, ITEMS.shield.color, 8, 3)
    return
  }
  hp.value--
  invulnUntil = now + INVULN
  hurtAt = now
  shake = 12
  hurt()
  burst(ship.x, ship.y, colors.red, 14, 4)
  if (hp.value <= 0) destroyShip(now)
}

function destroyShip(now) {
  ship.dead = true
  ship.thrust = false
  shake = 24
  boom({ big: true })
  burst(ship.x, ship.y, colors.accent, 50, 7)
  burst(ship.x, ship.y, colors.orange, 40, 5)
  elapsed.value = now - playStart
  setPhase('lost', now)

  if (caught.value > best.value) {
    best.value = caught.value
    newBest.value = true
    try { localStorage.setItem('gameBestOrbs', String(caught.value)) } catch { /* private mode */ }
    // celebrate once the score panel is up
    setTimeout(() => {
      if (phase.value !== 'lost') return
      confetti(width / 2, height / 2, { count: 140, power: 13 })
      chime()
    }, 900)
  }
}

function pickUp(pk) {
  pk.taken = true
  hp.value = Math.min(MAX_HP, hp.value + HEAL)
  heal()
  burst(pk.x, pk.y, colors.green, 16, 3.5)
  addLabel(pk.x, pk.y - 14, `+${HEAL} ♥`, colors.green)
}

// ------------------------------------------------------------ items

function freeSlot() {
  return slots.value.indexOf(null)
}

function pickItem(pk) {
  const i = freeSlot()
  if (i < 0) return
  pk.taken = true
  slots.value[i] = pk.kind
  pickup()
  const def = ITEMS[pk.kind]
  burst(pk.x, pk.y, def.color, 16, 3.5)
  addLabel(pk.x, pk.y - 16, t(def.nameKey), def.color)
}

function useItem(i) {
  if (phase.value !== 'play' || ship.dead) return
  const kind = slots.value[i]
  if (!kind) { nope(); return }
  slots.value[i] = null
  const now = performance.now()
  const def = ITEMS[kind]
  addLabel(ship.x, ship.y - 30, t(def.nameKey), def.color)

  if (kind === 'shield') {
    shieldUntil = now + def.duration
    powerUp()
  } else if (kind === 'magnet') {
    magnetUntil = now + def.duration
    powerUp()
  } else if (kind === 'multishot') {
    multiUntil = now + def.duration
    powerUp()
  } else if (kind === 'push') {
    pushWave(now)
  } else if (kind === 'mine') {
    // dropped behind the ship
    mines.push({
      x: ship.x - Math.cos(ship.angle) * 22,
      y: ship.y - Math.sin(ship.angle) * 22,
      vx: 0, vy: 0, hunting: false,
      born: now, armedAt: now + MINE_ARM, radius: MINE_RADIUS, done: false,
    })
    clunk()
  } else if (kind === 'killall') {
    killAll(now)
  }
}

/** Shock wave that flings enemies away and wipes out their shots. */
function pushWave(now) {
  whoosh()
  shake = Math.max(shake, 8)
  pulses.push({ x: ship.x, y: ship.y, born: now, radius: PUSH_RADIUS, dur: 450, color: ITEMS.push.color })
  for (const e of enemies) {
    const dx = e.x - ship.x
    const dy = e.y - ship.y
    const d = Math.hypot(dx, dy) || 1
    if (d > PUSH_RADIUS) continue
    const f = 5 + (1 - d / PUSH_RADIUS) * 16
    e.vx = (dx / d) * f
    e.vy = (dy / d) * f
    e.stunUntil = now + 1000
    e.flash = 1
  }
  shots = shots.filter((sh) => (sh.x - ship.x) ** 2 + (sh.y - ship.y) ** 2 > PUSH_RADIUS ** 2)
  slime = slime.filter((p) => (p.x - ship.x) ** 2 + (p.y - ship.y) ** 2 > PUSH_RADIUS ** 2)
}

/** Mine blast: destroys enemies around it, hurts the ship too, and sets off nearby mines. */
function detonate(m, now) {
  if (m.done) return
  m.done = true
  const color = ITEMS.mine.color
  boom()
  shake = Math.max(shake, 10)
  pulses.push({ x: m.x, y: m.y, born: now, radius: m.radius, dur: 380, color })
  burst(m.x, m.y, color, 30, 6)
  burst(m.x, m.y, colors.orange, 20, 4)
  for (const e of enemies) {
    if (!e.dead && Math.hypot(e.x - m.x, e.y - m.y) < m.radius + e.r) killEnemy(e, now)
  }
  if (!ship.dead && Math.hypot(ship.x - m.x, ship.y - m.y) < m.radius) hurtShip(now) // friendly fire!
  for (const other of mines) {
    if (!other.done && Math.hypot(other.x - m.x, other.y - m.y) < m.radius) detonate(other, now)
  }
}

/** The ultimate: every enemy on screen is gone. */
function killAll(now) {
  boom({ big: true })
  flashAt = now
  shake = 22
  pulses.push({ x: ship.x, y: ship.y, born: now, radius: Math.hypot(width, height), dur: 700, color: ITEMS.killall.color })
  for (const e of enemies) killEnemy(e, now, false)
  shots = []
}

/** Is an enemy roughly in the line of fire? Used for auto-fire with pointer / touch steering. */
function enemyAhead() {
  return enemies.some((e) => {
    const dx = e.x - ship.x
    const dy = e.y - ship.y
    if (dx * dx + dy * dy > 520 ** 2) return false
    const diff = Math.atan2(dy, dx) - ship.angle
    return Math.abs(Math.atan2(Math.sin(diff), Math.cos(diff))) < 0.28
  })
}

/** Check one bolt against enemies and mines. */
function boltHits(b, now) {
  for (const e of enemies) {
    if (e.dead || (b.x - e.x) ** 2 + (b.y - e.y) ** 2 > (e.r + 5) ** 2) continue
    b.life = 0
    e.hp--
    e.flash = 1
    e.vx += b.vx * 0.15 // knockback
    e.vy += b.vy * 0.15
    burst(b.x, b.y, colors.teal, 5, 2.5)
    if (e.hp <= 0) killEnemy(e, now)
    return
  }
  // shooting a mine sets it off
  for (const m of mines) {
    if (!m.done && (b.x - m.x) ** 2 + (b.y - m.y) ** 2 < 14 ** 2) {
      b.life = 0
      detonate(m, now)
      return
    }
  }
}

function updateCombat(step, now) {
  const alive = !ship.dead
  const playing = phase.value === 'play'
  const dif = difficulty()

  if (playing) {
    if (now > nextEnemy && enemies.length < dif.maxEnemies) {
      spawnEnemy(now)
      nextEnemy = now + dif.spawnEvery * rand(0.75, 1.25)
    }
    if (now > nextItem) {
      const s = arenaSpot()
      spawnPack(s.x, s.y, now, randomItem())
      nextItem = now + rand(14000, 20000)
    }
    if (now > nextPack) {
      if (hp.value < MAX_HP) {
        const s = arenaSpot()
        spawnPack(s.x, s.y, now)
      }
      nextPack = now + rand(9000, 14000)
    }

    // fire: Space / F / X / J, or automatically when steering by pointer or touch
    const trigger = keys.has(' ') || keys.has('f') || keys.has('x') || keys.has('j')
    if (alive && (trigger || ((touch || pointer.down) && enemyAhead())) && now - lastShot > FIRE_RATE) {
      lastShot = now
      const spread = now < multiUntil ? MULTISHOT_SPREAD : [0]
      for (const off of spread) {
        const cx = Math.cos(ship.angle + off)
        const cy = Math.sin(ship.angle + off)
        bolts.push({ x: ship.x + cx * 18, y: ship.y + cy * 18, vx: cx * 12 + ship.vx * 0.4, vy: cy * 12 + ship.vy * 0.4, life: 1 })
      }
      zap()
    }
  }

  for (const e of enemies) {
    const dx = ship.x - e.x
    const dy = ship.y - e.y
    const d = Math.hypot(dx, dy) || 1
    e.phase += 0.15 * step
    e.flash = Math.max(0, e.flash - 0.12 * step)
    e.look = Math.atan2(dy, dx)

    if (now < e.stunUntil) {
      // knocked back by a push: tumble and slow down
      e.vx *= 0.95 ** step
      e.vy *= 0.95 ** step
    } else if (e.type === 'toxic') {
      // slowly meander towards the ship, smearing slime everywhere
      const want = alive ? e.look + Math.sin(e.phase * 0.08) * 1.1 : e.angle + 0.01
      e.vx += (Math.cos(want) * e.speed - e.vx) * 0.02 * step
      e.vy += (Math.sin(want) * e.speed - e.vy) * 0.02 * step
    } else if (e.type === 'bug') {
      // crawl at the ship with a bit of wobble; wander once it's gone
      const want = alive ? e.look + Math.sin(e.phase * 0.35) * 0.6 : e.angle + Math.sin(e.phase * 0.2) * 0.08
      e.vx += (Math.cos(want) * e.speed - e.vx) * 0.05 * step
      e.vy += (Math.sin(want) * e.speed - e.vy) * 0.05 * step
    } else {
      // keep some distance, circle around and fire
      const away = !alive ? 0 : d < 220 ? -1 : d > 320 ? 1 : 0
      const tx = (dx / d) * away + (-dy / d) * 0.7
      const ty = (dy / d) * away + (dx / d) * 0.7
      e.vx += (tx * e.speed - e.vx) * 0.03 * step
      e.vy += (ty * e.speed - e.vy) * 0.03 * step
      if (alive && playing && now > e.nextShot && d < 650) {
        e.nextShot = now + dif.fireEvery * rand(0.8, 1.2)
        const a = e.look + rand(-0.08, 0.08)
        shots.push({ x: e.x, y: e.y, vx: Math.cos(a) * 4.2, vy: Math.sin(a) * 4.2, life: 1 })
      }
    }
    if (now < e.stunUntil) e.angle += 0.3 * step
    else e.angle = Math.atan2(e.vy, e.vx)
    e.x += e.vx * step
    e.y += e.vy * step

    if (e.type === 'toxic') {
      e.trail += Math.hypot(e.vx, e.vy) * step
      if (e.trail > SLIME_GAP) {
        e.trail = 0
        // drop the blob just behind it
        slime.push({ x: e.x - Math.cos(e.angle) * e.r, y: e.y - Math.sin(e.angle) * e.r, r: rand(11, 15), born: now })
        if (slime.length > SLIME_MAX) slime.shift()
      }
    }

    // ramming the ship costs a life, and the enemy
    if (alive && d < e.r + 12) {
      hurtShip(now)
      killEnemy(e, now)
    }
  }

  // slime: entering it hurts once, staying in it slows the ship down
  slime = slime.filter((p) => now - p.born < SLIME_TTL)
  const inSlime = alive && slime.some((p) => now - p.born < SLIME_TTL - 1000 && (p.x - ship.x) ** 2 + (p.y - ship.y) ** 2 < (p.r + 4) ** 2)
  if (inSlime && !ship.slimed) {
    hurtShip(now)
    burst(ship.x, ship.y, colors.lime, 14, 3)
    addLabel(ship.x, ship.y - 26, t('gameSlimed'), colors.lime)
  }
  ship.slimed = inSlime

  for (const b of bolts) {
    b.life -= 0.022 * step
    // move in small steps so fast bolts can't skip over a target on slow frames
    const n = Math.ceil((Math.hypot(b.vx, b.vy) * step) / 8)
    for (let i = 0; i < n && b.life > 0; i++) {
      b.x += (b.vx * step) / n
      b.y += (b.vy * step) / n
      boltHits(b, now)
    }
  }

  // armed mines lock on to the nearest enemy in range, chase it and blow up on contact
  for (const m of mines) {
    if (m.done) continue
    let target = null
    if (now >= m.armedAt) {
      let best = MINE_SEEK ** 2
      for (const e of enemies) {
        const d2 = (e.x - m.x) ** 2 + (e.y - m.y) ** 2
        if (!e.dead && d2 < best) { best = d2; target = e }
      }
    }
    m.hunting = !!target
    if (target) {
      const dx = target.x - m.x
      const dy = target.y - m.y
      const d = Math.hypot(dx, dy) || 1
      // steer the velocity towards the target (rather than just accelerating at it)
      // so the sideways drift dies out and the mine doesn't end up orbiting its prey
      const k = Math.min(1, 0.14 * step)
      m.vx += ((dx / d) * MINE_SPEED - m.vx) * k
      m.vy += ((dy / d) * MINE_SPEED - m.vy) * k
      // a little rocket trail
      if (Math.random() < 0.6 * step) {
        sparks.push({ x: m.x, y: m.y, vx: -m.vx * 0.2 + rand(-0.5, 0.5), vy: -m.vy * 0.2 + rand(-0.5, 0.5), life: 0.5, color: Math.random() < 0.5 ? ITEMS.mine.color : colors.orange, size: rand(1.5, 3) })
      }
      if (d < target.r + 10) { detonate(m, now); continue }
    } else {
      m.vx *= 0.93 ** step // drift to a stop and wait
      m.vy *= 0.93 ** step
    }
    m.x += m.vx * step
    m.y += m.vy * step
  }

  for (const s of shots) {
    s.x += s.vx * step
    s.y += s.vy * step
    s.life -= 0.006 * step
    if (alive && (s.x - ship.x) ** 2 + (s.y - ship.y) ** 2 < 13 ** 2) {
      s.life = 0
      hurtShip(now)
    }
  }

  // pickups drift into the ship's magnet like the dots do (items only while there's room)
  const room = freeSlot() >= 0
  for (const pk of packs) {
    const dx = ship.x - pk.x
    const dy = ship.y - pk.y
    const d = Math.hypot(dx, dy) || 1
    const wanted = pk.kind === 'health' || room
    if (alive && wanted && d < 24) {
      if (pk.kind === 'health') pickUp(pk); else pickItem(pk)
      continue
    }
    if (alive && wanted && d < ship.magnet) {
      pk.vx += (dx / d) * 0.6 * step
      pk.vy += (dy / d) * 0.6 * step
    }
    pk.vx *= 0.9 ** step
    pk.vy *= 0.9 ** step
    pk.x += pk.vx * step
    pk.y += pk.vy * step
  }

  const near = (o, m) => o.x > -m && o.x < width + m && o.y > -m && o.y < height + m
  enemies = enemies.filter((e) => !e.dead && near(e, 400))
  bolts = bolts.filter((b) => b.life > 0 && near(b, 10))
  shots = shots.filter((s) => s.life > 0 && near(s, 10))
  packs = packs.filter((pk) => !pk.taken && now - pk.born < pk.ttl)
  mines = mines.filter((m) => !m.done)
  pulses = pulses.filter((pl) => now - pl.born < pl.dur)
}

function drawCombat(now) {
  drawSlime(ctx, slime, colors.lime, now, SLIME_TTL)
  for (const m of mines) drawMine(ctx, m, ITEMS.mine.color, now)
  for (const pk of packs) {
    if (pk.kind === 'health') drawPack(ctx, pk, colors, now)
    else drawItem(ctx, pk, ITEMS[pk.kind], iconPath(pk.kind), now)
  }
  for (const e of enemies) ({ bug: drawBug, virus: drawVirus, toxic: drawVirus })[e.type](ctx, e, colors)
  drawShots(ctx, shots, colors)
  drawBolts(ctx, bolts, colors)
  for (const pl of pulses) drawPulse(ctx, pl, now)
}

// ------------------------------------------------------------ draw

function drawStars(alpha) {
  ctx.fillStyle = colors.muted
  for (const s of stars) {
    ctx.globalAlpha = alpha * s.z * 0.7
    ctx.fillRect(s.x, s.y, s.z * 1.8, s.z * 1.8)
  }
}

function drawDust(t, back) {
  let color = ''
  for (const d of dust) {
    const p = clamp01((t - d.delay) / FLY)
    const e = back ? 1 - ease(p) : ease(p)   // 0 = at its spot in the page, 1 = at its dot
    const tg = d.target
    const ex = back ? d.sx : tg.x
    const ey = back ? d.sy : tg.y
    const endX = ex + d.jx * (1 - e * 0.6)
    const endY = ey + d.jy * (1 - e * 0.6)
    const curve = Math.sin(Math.PI * e) * d.swirl
    // perpendicular offset gives each speck a curved path
    const dx = endX - d.ox
    const dy = endY - d.oy
    const len = Math.hypot(dx, dy) || 1
    const x = d.ox + dx * e - (dy / len) * curve
    const y = d.oy + dy * e + (dx / len) * curve

    let a
    if (back) a = p >= 1 ? clamp01(1 - (t - d.delay - FLY - FADE) / 400) : clamp01(0.35 + p)
    else a = clamp01(Math.min(t / Math.max(FADE * 0.6, 1), 1 - (e - 0.75) / 0.25))
    if (a <= 0) continue
    if (tg.color !== color) { color = tg.color; ctx.fillStyle = color }
    ctx.globalAlpha = a
    const s = d.size * (1 - e * 0.3)
    ctx.fillRect(x - s / 2, y - s / 2, s, s)
  }
}

function drawTargets(alphaFor, now = 0) {
  for (const tg of targets) {
    if (!tg.active) continue
    const a = alphaFor(tg)
    if (a <= 0) continue
    // freshly respawned dots pop in with a shrinking ring
    const age = now - tg.spawnedAt
    const pop = tg.spawnedAt && age < RESPAWN_POP ? clamp01(age / RESPAWN_POP) : 1
    const r = tg.r * (1 - (1 - pop) ** 3 + Math.sin(pop * Math.PI) * 0.4) // grows with a little overshoot
    if (r <= 0) continue
    if (pop < 1) {
      ctx.strokeStyle = tg.color
      ctx.lineWidth = 1.5
      ctx.globalAlpha = a * (1 - pop)
      ctx.beginPath()
      ctx.arc(tg.x, tg.y, r + 4 + (1 - pop) * 30, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.fillStyle = tg.color
    ctx.globalAlpha = a * 0.16
    ctx.beginPath()
    ctx.arc(tg.x, tg.y, r * 2.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = a
    ctx.beginPath()
    ctx.arc(tg.x, tg.y, r, 0, Math.PI * 2)
    ctx.fill()
    if (tg.card) {
      ctx.strokeStyle = tg.color
      ctx.lineWidth = 1.2
      ctx.globalAlpha = a * 0.6
      ctx.strokeRect(tg.x - r * 1.8, tg.y - r * 1.8, r * 3.6, r * 3.6)
    }
  }
}

function drawShip() {
  ctx.save()
  ctx.translate(ship.x, ship.y)
  ctx.rotate(ship.angle)
  ctx.scale(ship.scale, ship.scale)
  ctx.globalAlpha = 1

  // pickup range hint; brighter and magenta while the orb magnet is on (flickers before it ends)
  const now = performance.now()
  const boosted = now < magnetUntil && !(magnetUntil - now < 2000 && Math.floor(now / 120) % 2)
  ctx.strokeStyle = boosted ? ITEMS.magnet.color : colors.accent
  ctx.globalAlpha = boosted ? 0.3 : 0.08
  ctx.lineWidth = boosted ? 1.5 : 1
  if (boosted) {
    ctx.setLineDash([6, 8])
    ctx.lineDashOffset = -now / 40
  }
  ctx.beginPath()
  ctx.arc(0, 0, ship.magnet, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // flame
  if (ship.thrust) {
    const f = rand(10, 18)
    ctx.globalAlpha = 0.9
    ctx.fillStyle = colors.orange
    ctx.beginPath()
    ctx.moveTo(-9, -5)
    ctx.lineTo(-9 - f, 0)
    ctx.lineTo(-9, 5)
    ctx.fill()
  }

  // hull
  ctx.globalAlpha = 1
  ctx.shadowColor = colors.accent
  ctx.shadowBlur = 16
  ctx.fillStyle = colors.accent
  ctx.beginPath()
  ctx.moveTo(18, 0)
  ctx.lineTo(-11, -12)
  ctx.lineTo(-6, 0)
  ctx.lineTo(-11, 12)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0
  // cockpit
  ctx.fillStyle = colors.teal
  ctx.beginPath()
  ctx.ellipse(4, 0, 4.5, 2.6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawWarp(p) {
  // collapsing rings + a flash where the ship appears
  ctx.strokeStyle = colors.teal
  for (let i = 0; i < 3; i++) {
    const q = clamp01(p * 1.4 - i * 0.18)
    if (q <= 0 || q >= 1) continue
    ctx.globalAlpha = (1 - q) * 0.8
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, 140 * (1 - q) + 6, 0, Math.PI * 2)
    ctx.stroke()
  }
  if (p > 0.55) {
    const q = (p - 0.55) / 0.45
    ctx.fillStyle = colors.text
    ctx.globalAlpha = (1 - q) * 0.6
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, 8 + q * 60, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawEffects() {
  for (const p of sparks) {
    ctx.globalAlpha = clamp01(p.life)
    ctx.fillStyle = p.color
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
  }
  ctx.font = `600 13px ${colors.font}`
  ctx.textAlign = 'center'
  for (const l of labels) {
    ctx.globalAlpha = clamp01(l.life * 1.4)
    ctx.fillStyle = l.color
    ctx.fillText(l.text, l.x, l.y)
  }
}

// ------------------------------------------------------------ loop

function frame(now) {
  // schedule first, so one bad frame can't stop the game
  rafId = requestAnimationFrame(frame)
  const step = lastTime ? Math.min((now - lastTime) / 16.67, 3) : 1
  lastTime = now
  const t = now - phaseStart
  ctx.clearRect(0, 0, width, height)

  // screen shake after a hit
  ctx.save()
  if (shake > 0.3) {
    ctx.translate(rand(-shake, shake), rand(-shake, shake))
    shake *= 0.86 ** step
  } else shake = 0
  // the ship blinks while it can't be hit
  const blink = now < invulnUntil && Math.floor(now / 90) % 2

  const arrivalOf = (tg) => tg.delay + FLY

  switch (phase.value) {
    case 'dissolve': {
      drawStars(clamp01(t / 1200))
      // dots slide from their place in the page to their spot in the arena
      for (const tg of targets) {
        const e = ease(clamp01((t - tg.delay) / FLY))
        tg.x = tg.sx + (tg.tx - tg.sx) * e
        tg.y = tg.sy + (tg.ty - tg.sy) * e
      }
      drawDust(t, false)
      drawTargets((tg) => clamp01((t - arrivalOf(tg) + FLY * 0.35) / (FLY * 0.35)))

      const w = t - SETTLED
      if (w > 0) {
        ship.scale = ease(clamp01((w - WARP * 0.5) / (WARP * 0.5)))
        drawWarp(clamp01(w / WARP))
        if (ship.scale > 0) drawShip()
      }
      if (w >= WARP) {
        ship.scale = 1
        playStart = now
        nextEnemy = now + FIRST_ENEMY
        nextPack = now + 12000
        nextItem = now + 7000
        setPhase('play', now)
      }
      break
    }

    case 'play':
      updateShip(step, now)
      updateCombat(step, now)
      updateEffects(step)
      drawStars(1)
      drawTargets(() => 1, now)
      drawCombat(now)
      drawEffects()
      if (!ship.dead && !blink) drawShip()
      if (!ship.dead && now < shieldUntil) drawShieldBubble(ctx, ship.x, ship.y, ITEMS.shield.color, shieldUntil - now, now)
      if (now - lastHud > 100 && phase.value === 'play') {
        elapsed.value = now - playStart
        shieldLeft.value = Math.max(0, shieldUntil - now)
        multiLeft.value = Math.max(0, multiUntil - now)
        magnetLeft.value = Math.max(0, magnetUntil - now)
        if (banner.value && now > bannerUntil) banner.value = 0
        lastHud = now
      }
      break

    case 'lost':
      // the bugs keep crawling around over the wreck
      updateCombat(step, now)
      updateEffects(step)
      drawStars(1)
      drawTargets(() => 1, now)
      drawCombat(now)
      drawEffects()
      break

    case 'restore': {
      updateEffects(step)
      const fade = clamp01(1 - t / 500)
      drawStars(fade)
      drawEffects()
      drawTargets(() => fade)
      ship.scale = fade
      if (fade > 0 && !ship.dead) drawShip()
      drawDust(t, true)
      const back = WAVE * 0.6 + 140 + FLY
      if (t >= back && !finishing) finish()
      break
    }
  }

  ctx.restore()

  // white flash for the kill-all
  const sinceFlash = now - flashAt
  if (sinceFlash < 500) {
    ctx.globalAlpha = 0.55 * (1 - sinceFlash / 500)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
  }

  // red flash when hit
  const sinceHurt = now - hurtAt
  if (sinceHurt < 350) {
    ctx.globalAlpha = 0.16 * (1 - sinceHurt / 350)
    ctx.fillStyle = colors.red
    ctx.fillRect(0, 0, width, height)
  }

  ctx.globalAlpha = 1
}

// ------------------------------------------------------------ input

const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown', 'Home', 'End'])

function onKeyDown(e) {
  if (e.key === 'Escape') { startRestore(); return }
  if (!e.repeat && (e.key === '1' || e.key === '2' || e.key === '3')) useItem(Number(e.key) - 1)
  if (GAME_KEYS.has(e.key)) e.preventDefault()
  keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key)
}

function onKeyUp(e) {
  keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key)
}

function onPointerDown(e) {
  pointer.down = true
  pointer.x = e.clientX
  pointer.y = e.clientY
  canvas.value.setPointerCapture?.(e.pointerId)
}

function onPointerMove(e) {
  pointer.x = e.clientX
  pointer.y = e.clientY
}

function onPointerUp() {
  pointer.down = false
}

const preventScroll = (e) => e.preventDefault()
const releaseKeys = () => keys.clear()

// ------------------------------------------------------------ lifecycle

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  readColors()
  resize()
  setup()                                       // sample the page while it's still visible
  document.documentElement.classList.add('game-on')
  // Space fires, so make sure it can't also "click" whatever button has focus
  document.activeElement?.blur?.()
  phaseStart = performance.now()
  rafId = requestAnimationFrame(frame)

  window.addEventListener('resize', resize)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('wheel', preventScroll, { passive: false })
  window.addEventListener('blur', releaseKeys)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  document.documentElement.classList.remove('game-on')
  window.removeEventListener('resize', resize)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('wheel', preventScroll)
  window.removeEventListener('blur', releaseKeys)
})
</script>

<template>
  <Teleport to="body">
    <div class="game" role="dialog" :aria-label="t('gameTitle')">
      <canvas
        ref="canvas"
        class="game-canvas"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @contextmenu.prevent
      />

      <div class="hud" :class="{ shown: phase === 'play' || phase === 'lost' }">
        <div class="hud-left">
          <div class="score">
            <span class="level" :title="t('gameLevel', { n: level })">{{ t('gameLevelShort', { n: level }) }}</span>
            <span class="count" :title="t('gameOrbs')">{{ caught }} <small>{{ t('gameOrbsShort') }}</small></span>
            <span class="bar" :title="t('gameNextLevel')"><span :style="{ transform: `scaleX(${levelProgress})` }" /></span>
            <span class="time">{{ time }}</span>
          </div>
          <div class="kills" role="img" :aria-label="t('gameKills', { n: kills })" :title="t('gameKills', { n: kills })">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.crosshair" fill-rule="evenodd" /></svg>
            <span :key="kills" class="kills-n">{{ kills }}</span>
          </div>
        </div>
        <div class="hud-right">
          <span
            class="hearts"
            :class="{ low: hp === 1 }"
            role="img"
            :aria-label="t('gameHealth', { n: hp, max: MAX_HP })"
          >
            <BaseIcon v-for="i in MAX_HP" :key="i" name="heart" :class="{ empty: i > hp }" />
          </span>
          <button class="close" type="button" :aria-label="t('gameExit')" :title="t('gameExit')" @click="startRestore">
            ✕
          </button>
        </div>
      </div>

      <!-- active effects -->
      <div class="buffs">
        <span v-if="shieldLeft > 0" class="buff" :style="{ '--c': ITEMS.shield.color }">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.shield" fill-rule="evenodd" /></svg>
          {{ Math.ceil(shieldLeft / 1000) }}s
        </span>
        <span v-if="magnetLeft > 0" class="buff" :style="{ '--c': ITEMS.magnet.color }">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.magnet" fill-rule="evenodd" /></svg>
          {{ Math.ceil(magnetLeft / 1000) }}s
        </span>
        <span v-if="multiLeft > 0" class="buff" :style="{ '--c': ITEMS.multishot.color }">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS.multishot" fill-rule="evenodd" /></svg>
          {{ Math.ceil(multiLeft / 1000) }}s
        </span>
      </div>

      <!-- carried items: keys 1 – 3, or tap -->
      <div class="inventory" :class="{ shown: phase === 'play' }" :aria-label="t('gameInventory')" role="group">
        <button
          v-for="(kind, i) in slots"
          :key="i"
          type="button"
          class="slot"
          :class="{ filled: kind }"
          :style="kind ? { '--c': ITEMS[kind].color } : null"
          :title="kind ? `${i + 1}: ${t(ITEMS[kind].nameKey)}` : t('gameSlotEmpty', { key: i + 1 })"
          :aria-label="kind ? `${i + 1}: ${t(ITEMS[kind].nameKey)}` : t('gameSlotEmpty', { key: i + 1 })"
          tabindex="-1"
          @pointerdown.stop
          @click="useItem(i)"
        >
          <span class="key">{{ i + 1 }}</span>
          <Transition name="item">
            <svg v-if="kind" :key="kind" viewBox="0 0 24 24" aria-hidden="true"><path :d="ICONS[kind]" fill-rule="evenodd" /></svg>
          </Transition>
        </button>
      </div>

      <Transition name="banner">
        <div v-if="banner" :key="banner" class="level-banner" aria-live="polite">
          <strong>{{ t('gameLevel', { n: banner }) }}</strong>
          <span>{{ t('gameLevelUp') }}</span>
        </div>
      </Transition>

      <p class="hint" :class="{ shown: phase === 'play' && elapsed < 8000 }">
        {{ touch ? t('gameHintTouch') : t('gameHint') }}
      </p>

      <Transition name="pop">
        <div v-if="phase === 'lost'" class="panel lost">
          <h2>{{ t('gameLost') }}</h2>
          <p class="score-big">{{ caught }} <small>{{ t('gameOrbsShort') }}</small></p>
          <p>{{ t('gameLostText', { time }) }}</p>
          <p>{{ t('gameReached', { n: level }) }} · {{ t('gameKills', { n: kills }) }}</p>
          <p v-if="best" class="best">{{ newBest ? t('gameNewBest') : t('gameBest', { n: best }) }}</p>
          <div class="actions">
            <button type="button" class="restore" @click="retry">{{ t('gameRetry') }}</button>
            <button type="button" class="restore secondary" @click="startRestore">{{ t('gameRestore') }}</button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.game {
  position: fixed;
  inset: 0;
  z-index: 100;
  user-select: none;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: crosshair;
}

.hud {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity .4s, transform .4s;
}

.hud.shown { opacity: 1; transform: none; }

.score {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-raised) 80%, transparent);
  backdrop-filter: blur(8px);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.count small { color: var(--muted); font-weight: 600; }

.hud-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--bg);
  font-size: .8rem;
  letter-spacing: .03em;
}

.kills {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-raised) 80%, transparent);
  backdrop-filter: blur(8px);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.kills svg { width: 18px; height: 18px; fill: #f2545b; }
.kills-n { display: inline-block; animation: bump .25s ease-out; }

@keyframes bump {
  from { transform: scale(1.5); color: #f2545b; }
}

.buffs {
  position: absolute;
  top: 68px;
  right: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  pointer-events: none;
}

.buff {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--c);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-raised) 80%, transparent);
  color: var(--c);
  font-size: .85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.buff svg { width: 16px; height: 16px; fill: currentColor; }

.inventory {
  position: absolute;
  left: 50%;
  bottom: 18px;
  display: flex;
  gap: 10px;
  transform: translate(-50%, 12px);
  opacity: 0;
  pointer-events: none;
  transition: opacity .4s, transform .4s;
}

.inventory.shown { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }

.slot {
  position: relative;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  padding: 0;
  border: 1.5px dashed var(--border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--bg-raised) 70%, transparent);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s, transform .15s;
}

.slot.filled {
  border: 1.5px solid var(--c);
  box-shadow: 0 0 16px color-mix(in srgb, var(--c) 40%, transparent);
}

.slot:active { transform: scale(.92); }
.slot svg { width: 28px; height: 28px; fill: var(--c); }

.slot .key {
  position: absolute;
  top: -8px;
  left: -8px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--bg-raised);
  color: var(--muted);
  font-size: .7rem;
  font-weight: 700;
}

.item-enter-active { transition: transform .35s cubic-bezier(.2, 1.6, .4, 1), opacity .2s; }
.item-leave-active { position: absolute; transition: transform .25s, opacity .25s; }
.item-enter-from { transform: scale(0) rotate(-90deg); opacity: 0; }
.item-leave-to { transform: scale(1.8); opacity: 0; }

.level-banner {
  position: absolute;
  top: 26%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transform: translateX(-50%);
  pointer-events: none;
  text-align: center;
}

.level-banner strong {
  font-size: clamp(2.2rem, 7vw, 4rem);
  font-weight: 800;
  letter-spacing: .02em;
  background: linear-gradient(90deg, var(--blue), var(--teal));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 18px color-mix(in srgb, var(--blue) 50%, transparent));
}

.level-banner span { color: #f2545b; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; font-size: .85rem; }

.banner-enter-active { transition: opacity .3s, transform .45s cubic-bezier(.2, 1.5, .4, 1); }
.banner-leave-active { transition: opacity .5s, transform .5s; }
.banner-enter-from { opacity: 0; transform: translateX(-50%) scale(.5); }
.banner-leave-to { opacity: 0; transform: translateX(-50%) translateY(-20px); }

.bar {
  position: relative;
  width: clamp(60px, 18vw, 160px);
  height: 6px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}

.bar span {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--blue), var(--teal));
  transform-origin: left;
  transition: transform .2s;
}

.time { color: var(--muted); font-size: .9rem; }

.hud-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hearts {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-raised) 80%, transparent);
  backdrop-filter: blur(8px);
  color: #f2545b;
  font-size: 18px;
}

.hearts :deep(svg) {
  transition: transform .25s, opacity .25s, color .25s;
  filter: drop-shadow(0 0 4px color-mix(in srgb, #f2545b 60%, transparent));
}

.hearts :deep(svg.empty) {
  color: var(--muted);
  opacity: .35;
  transform: scale(.75);
  filter: none;
}

.hearts.low { animation: heartbeat .8s ease-in-out infinite; }

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.12); }
  30% { transform: scale(1); }
}

.close {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: color-mix(in srgb, var(--bg-raised) 80%, transparent);
  backdrop-filter: blur(8px);
  color: var(--text);
  font-size: 16px;
  cursor: pointer;
  pointer-events: auto;
  transition: border-color .2s, transform .2s;
}

.close:hover { border-color: var(--accent); transform: rotate(90deg); }
.close:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.hint {
  position: absolute;
  left: 50%;
  bottom: 90px;
  margin: 0;
  padding: 8px 16px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-raised) 75%, transparent);
  color: var(--muted);
  font-size: .85rem;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  transform: translate(-50%, 8px);
  opacity: 0;
  transition: opacity .5s, transform .5s;
}

.hint.shown { opacity: 1; transform: translate(-50%, 0); }

.panel {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(380px, calc(100vw - 32px));
  padding: 28px 24px 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--bg-raised) 90%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px var(--shadow);
  text-align: center;
  transform: translate(-50%, -50%);
}

.panel h2 {
  margin: 0 0 8px;
  font-size: 1.5rem;
  background: linear-gradient(90deg, var(--blue), var(--teal));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.panel p { margin: 0 0 6px; color: var(--muted); }
.panel .best { font-weight: 700; color: var(--orange); }

.panel .score-big {
  margin: 4px 0 8px;
  color: var(--text);
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.panel .score-big small { color: var(--muted); font-size: 1rem; font-weight: 600; }

.panel.lost h2 {
  background: linear-gradient(90deg, #f2545b, var(--orange));
  -webkit-background-clip: text;
  background-clip: text;
}

.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.restore.secondary {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
}

.restore {
  margin-top: 14px;
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  background: var(--accent);
  color: var(--bg);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform .2s;
}

.restore:hover { transform: translateY(-2px); }
.restore:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.pop-enter-active { transition: opacity .4s, transform .4s cubic-bezier(.2, 1.4, .4, 1); }
.pop-enter-active.lost { transition-delay: .8s; } /* let the explosion play first */
.pop-leave-active { transition: opacity .25s, transform .25s; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translate(-50%, -50%) scale(.9); }

@media (max-width: 600px) {
  .hud { top: 12px; left: 12px; right: 12px; }
  .score { gap: 8px; padding: 0 12px; font-size: .9rem; }
  .bar, .time { display: none; }
  .kills { padding: 0 10px; }
  .buffs { top: 62px; right: 12px; }
  .slot { width: 48px; height: 48px; }
  .hearts { padding: 0 10px; font-size: 15px; gap: 1px; }
  .hint { white-space: normal; width: calc(100vw - 32px); }
}
</style>
