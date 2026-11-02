// Canvas drawings for the game's enemies, pickups and projectiles.
// Each function draws one thing at its position; `c` holds theme colours.

const TAU = Math.PI * 2

/** A bug: crawls straight at the ship. Six wiggling legs, spotted shell. */
export function drawBug(ctx, e, c, alpha = 1) {
  const r = e.r
  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.rotate(e.angle)
  ctx.globalAlpha = alpha

  // legs
  ctx.strokeStyle = c.text
  ctx.lineWidth = 1.5
  ctx.globalAlpha = alpha * 0.7
  for (let i = -1; i <= 1; i++) {
    const wiggle = Math.sin(e.phase + i * 2) * 3
    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(i * r * 0.45, 0)
      ctx.lineTo(i * r * 0.5 + wiggle * side, side * r * 1.25)
      ctx.stroke()
    }
  }

  // shell
  ctx.globalAlpha = alpha
  ctx.shadowColor = c.red
  ctx.shadowBlur = 12
  ctx.fillStyle = e.flash > 0 ? '#fff' : c.red
  ctx.beginPath()
  ctx.ellipse(0, 0, r, r * 0.78, 0, 0, TAU)
  ctx.fill()
  ctx.shadowBlur = 0

  // head, centre line and spots
  ctx.fillStyle = '#1a1d29'
  ctx.beginPath()
  ctx.arc(r * 0.9, 0, r * 0.42, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = '#1a1d29'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(r * 0.55, 0)
  ctx.lineTo(-r, 0)
  ctx.stroke()
  for (const [x, y] of [[0, -0.4], [0, 0.4], [-0.55, -0.3], [-0.55, 0.3]]) {
    ctx.beginPath()
    ctx.arc(x * r, y * r, r * 0.15, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

/**
 * A virus: spiky ball with an eye. The purple one hangs back and shoots; the
 * green "toxic" one is bigger, spins slowly and has dripping, blobby spikes.
 */
export function drawVirus(ctx, e, c, alpha = 1) {
  const toxic = e.type === 'toxic'
  const color = toxic ? c.lime : c.purple
  const r = e.r
  const spikes = toxic ? 7 : 9
  const tip = toxic ? 3.6 : 2.4
  ctx.save()
  ctx.translate(e.x, e.y)
  ctx.globalAlpha = alpha
  ctx.rotate(e.phase * (toxic ? 0.12 : 0.3))

  ctx.strokeStyle = e.flash > 0 ? '#fff' : color
  ctx.fillStyle = e.flash > 0 ? '#fff' : color
  ctx.lineWidth = 2
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * TAU
    const len = r * (1.45 + Math.sin(e.phase * (toxic ? 0.5 : 1) + i) * (toxic ? 0.2 : 0.12))
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8)
    ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(Math.cos(a) * len, Math.sin(a) * len, tip, 0, TAU)
    ctx.fill()
  }

  ctx.shadowColor = color
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, TAU)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.restore()

  // the eye always looks at its target, so draw it unrotated
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(e.x, e.y)
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.45, 0, TAU)
  ctx.fill()
  ctx.fillStyle = '#1a1d29'
  ctx.beginPath()
  ctx.arc(Math.cos(e.look) * r * 0.2, Math.sin(e.look) * r * 0.2, r * 0.22, 0, TAU)
  ctx.fill()
  ctx.restore()
}

/** Health pack: green cross in a pulsing ring; blinks when about to expire. */
export function drawPack(ctx, p, c, now) {
  const age = Math.max(0, now - p.born)
  if (p.ttl - age < 3000 && Math.floor(age / 120) % 2) return
  const pulse = 1 + Math.sin(age / 180) * 0.08
  const r = 11 * pulse * Math.min(1, age / 250)
  if (r <= 0) return
  ctx.save()
  ctx.translate(p.x, p.y)

  ctx.globalAlpha = 0.25
  ctx.strokeStyle = c.green
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, r + 6 + ((age / 25) % 12), 0, TAU)
  ctx.stroke()

  ctx.globalAlpha = 1
  ctx.shadowColor = c.green
  ctx.shadowBlur = 14
  ctx.fillStyle = c.green
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, TAU)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.fillStyle = '#fff'
  const a = r * 0.6
  const b = r * 0.2
  ctx.fillRect(-a, -b, a * 2, b * 2)
  ctx.fillRect(-b, -a, b * 2, a * 2)
  ctx.restore()
}

/** The ship's laser bolts: short glowing streaks. */
export function drawBolts(ctx, bolts, c) {
  ctx.save()
  ctx.strokeStyle = c.teal
  ctx.shadowColor = c.teal
  ctx.shadowBlur = 8
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  for (const b of bolts) {
    ctx.globalAlpha = Math.min(1, b.life * 3)
    ctx.beginPath()
    ctx.moveTo(b.x, b.y)
    ctx.lineTo(b.x - b.vx * 1.4, b.y - b.vy * 1.4)
    ctx.stroke()
  }
  ctx.restore()
}

/** Enemy shots: hot orange orbs. */
export function drawShots(ctx, shots, c) {
  ctx.save()
  ctx.fillStyle = c.orange
  ctx.shadowColor = c.orange
  ctx.shadowBlur = 10
  for (const s of shots) {
    ctx.globalAlpha = Math.min(1, s.life * 3)
    ctx.beginPath()
    ctx.arc(s.x, s.y, 4, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

/** Draw a 24×24 icon path centred at (x, y), `size` px wide. */
function drawIcon(ctx, path, x, y, size, color) {
  ctx.save()
  ctx.translate(x - size / 2, y - size / 2)
  ctx.scale(size / 24, size / 24)
  ctx.fillStyle = color
  ctx.fill(path, 'evenodd')
  ctx.restore()
}

/** An item pickup: a rounded badge with the item's icon; blinks when about to expire. */
export function drawItem(ctx, p, def, path, now) {
  const age = Math.max(0, now - p.born)
  if (p.ttl - age < 3000 && Math.floor(age / 120) % 2) return
  const s = 26 * Math.min(1, age / 250) * (1 + Math.sin(age / 200) * 0.06)
  if (s <= 0) return
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(Math.sin(age / 400) * 0.15)

  // spinning sparkle ring
  ctx.strokeStyle = def.color
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 5])
  ctx.lineDashOffset = -age / 30
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.85, 0, TAU)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.globalAlpha = 1
  ctx.shadowColor = def.color
  ctx.shadowBlur = 16
  ctx.fillStyle = '#12151f'
  ctx.strokeStyle = def.color
  ctx.lineWidth = 2
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.28)
  else ctx.rect(-s / 2, -s / 2, s, s)
  ctx.fill()
  ctx.stroke()
  ctx.shadowBlur = 0
  drawIcon(ctx, path, 0, 0, s * 0.62, def.color)
  ctx.restore()
}

/** A homing mine: spiky ball with a blinking light; blinks faster when armed and frantically while hunting. */
export function drawMine(ctx, m, color, now) {
  const armed = now >= m.armedAt
  const age = Math.max(0, now - m.born)
  const pop = Math.min(1, age / 200)
  const r = 8 * pop
  if (r <= 0) return
  ctx.save()
  ctx.translate(m.x, m.y)
  ctx.rotate(age / 900)

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    ctx.lineTo(Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6)
    ctx.stroke()
  }
  ctx.fillStyle = '#2a2f40'
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, TAU)
  ctx.fill()
  ctx.stroke()

  const on = Math.floor(age / (m.hunting ? 70 : armed ? 160 : 400)) % 2
  ctx.fillStyle = on ? color : '#5b6275'
  if (on) { ctx.shadowColor = color; ctx.shadowBlur = 12 }
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.38, 0, TAU)
  ctx.fill()
  ctx.restore()

  // faint blast radius once armed, so you know where not to be when it goes off
  if (armed) {
    ctx.save()
    ctx.globalAlpha = 0.07 + (on ? 0.05 : 0)
    ctx.strokeStyle = color
    ctx.setLineDash([3, 6])
    ctx.beginPath()
    ctx.arc(m.x, m.y, m.radius, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }
}

/** Shield bubble around the ship; flickers when it's about to run out. */
export function drawShieldBubble(ctx, x, y, color, left, now) {
  if (left < 1500 && Math.floor(now / 100) % 2) return
  ctx.save()
  ctx.translate(x, y)
  const r = 27 + Math.sin(now / 150) * 1.5
  ctx.globalAlpha = 0.14
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, TAU)
  ctx.fill()
  ctx.globalAlpha = 0.85
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.shadowColor = color
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, TAU)
  ctx.stroke()
  // a rotating highlight
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, r, now / 300, now / 300 + 0.9)
  ctx.stroke()
  ctx.restore()
}

/** An expanding shock ring (push, mine blast, kill-all). */
export function drawPulse(ctx, p, now) {
  const t = Math.min(1, Math.max(0, now - p.born) / p.dur)
  const e = 1 - (1 - t) ** 3
  const r = p.radius * e
  ctx.save()
  ctx.strokeStyle = p.color
  ctx.fillStyle = p.color
  ctx.globalAlpha = (1 - t) * 0.18
  ctx.beginPath()
  ctx.arc(p.x, p.y, r, 0, TAU)
  ctx.fill()
  ctx.globalAlpha = 1 - t
  ctx.lineWidth = 2 + (1 - t) * 6
  ctx.shadowColor = p.color
  ctx.shadowBlur = 18
  ctx.beginPath()
  ctx.arc(p.x, p.y, r, 0, TAU)
  ctx.stroke()
  ctx.restore()
}

/** Toxic slime: soft translucent blobs that fade in and, near the end of their life, out. */
export function drawSlime(ctx, slime, color, now, ttl) {
  ctx.save()
  ctx.fillStyle = color
  for (const p of slime) {
    const age = Math.max(0, now - p.born)
    const fade = Math.min(1, (ttl - age) / 2000, age / 300)
    if (fade <= 0) continue
    ctx.globalAlpha = 0.14 * fade
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}
