// Tiny dependency-free confetti burst on a temporary full-screen canvas.

const PALETTE_VARS = ['--blue', '--teal', '--orange', '--purple', '--pink', '--green']

/**
 * Burst confetti from a point on the screen (viewport coordinates).
 * Does nothing for visitors who prefer reduced motion.
 */
export function confetti(x, y, { count = 90, spread = Math.PI * 0.9, power = 11 } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const cs = getComputedStyle(document.documentElement)
  const colors = PALETTE_VARS.map((v) => cs.getPropertyValue(v).trim()).filter(Boolean)

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '50',
  })
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  // shoot upwards in a fan
  const pieces = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread
    const speed = power * (0.45 + Math.random() * 0.75)
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 6,
      h: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.35,
      wobble: Math.random() * Math.PI * 2,
      color: colors[(Math.random() * colors.length) | 0] || '#7c9cff',
      round: Math.random() < 0.3,
    }
  })

  const duration = 1800
  const start = performance.now()
  let last = start

  function frame(now) {
    const step = Math.min((now - last) / 16.67, 3)
    last = now
    const t = (now - start) / duration
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of pieces) {
      p.vy += 0.28 * step          // gravity
      p.vx *= 0.985 ** step        // air drag
      p.vy *= 0.985 ** step
      p.wobble += 0.15 * step
      p.x += (p.vx + Math.sin(p.wobble) * 0.6) * step
      p.y += p.vy * step
      p.rot += p.vrot * step

      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 0.6) / 0.4) // fade out at the end
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.h / 1.5, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // scaleY flip gives a "tumbling paper" look
        ctx.scale(1, Math.cos(p.wobble))
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    }

    if (t < 1) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
