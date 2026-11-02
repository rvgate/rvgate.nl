/*
 * Turns the rendered page into dots.
 *
 * Every visible element that holds text, every icon/image and every bordered
 * card becomes one game "target" (the dot you catch). Everything currently in
 * the viewport is also broken down into fine "dust": a few specks per
 * character, plus outlines of cards and filled icons. The dust is only used
 * for the dissolve and reassemble animations; each speck belongs to a target
 * and flies into it.
 *
 * All coordinates are viewport coordinates at the moment of sampling.
 */

const MAX_DUST = 4500

const isTransparent = (c) => !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c)

function visible(el, cs) {
  if (cs.visibility === 'hidden' || cs.display === 'none') return false
  if (el.checkVisibility && !el.checkVisibility()) return false
  return true
}

/** Viewport rects of each non-space character of a text node (only those on screen). */
function charRects(node, vw, vh) {
  const rects = []
  const text = node.textContent
  const range = document.createRange()
  for (let i = 0; i < text.length; i++) {
    if (/\s/.test(text[i])) continue
    range.setStart(node, i)
    range.setEnd(node, i + 1)
    const r = range.getBoundingClientRect()
    if (!r.width || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue
    rects.push(r)
  }
  return rects
}

const overlaps = (r, vw, vh) => r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw

export function sampleDom(root, { exclude = [] } = {}) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const targets = []
  const dust = []
  const excluded = (el) => exclude.some((sel) => el.closest(sel))

  const addDust = (target, x, y, size = 2) => dust.push({ target, ox: x, oy: y, size })

  // 1. elements with their own text
  const byParent = new Map()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  })
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement
    if (!el || excluded(el)) continue
    if (!byParent.has(el)) byParent.set(el, [])
    byParent.get(el).push(n)
  }

  const targetOf = new Map() // text element -> its target
  for (const [el, nodes] of byParent) {
    const cs = getComputedStyle(el)
    if (!visible(el, cs)) continue
    const rect = el.getBoundingClientRect()
    if (!rect.width || !rect.height) continue
    const text = nodes.map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim()
    const fontSize = parseFloat(cs.fontSize) || 16
    const t = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      color: cs.color,
      r: Math.min(8, 2.6 + fontSize / 14 + Math.sqrt(text.length) / 6), // bigger text, bigger orb
    }
    targets.push(t)
    targetOf.set(el, t)

    if (!overlaps(rect, vw, vh)) continue
    const speck = Math.max(1.5, Math.min(3, fontSize / 9))
    for (const node of nodes) {
      for (const r of charRects(node, vw, vh)) {
        // a few specks per glyph, inside its ink area
        const n = Math.max(1, Math.round((r.width * r.height) / 70))
        for (let i = 0; i < n; i++) {
          addDust(t,
            r.left + r.width * (0.15 + Math.random() * 0.7),
            r.top + r.height * (0.25 + Math.random() * 0.55),
            speck)
        }
      }
    }
  }

  // 2. icons, images and bordered cards
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  for (const el of root.querySelectorAll('*')) {
    if (excluded(el)) continue
    const tag = el.tagName.toLowerCase()
    const isMedia = tag === 'svg' || tag === 'img'
    if (!isMedia && el.closest('svg')) continue
    const cs = getComputedStyle(el)
    if (!isMedia) {
      const bw = parseFloat(cs.borderTopWidth)
      if (!bw || cs.borderTopStyle === 'none' || isTransparent(cs.borderTopColor)) continue
    }
    if (!visible(el, cs)) continue
    const rect = el.getBoundingClientRect()
    if (rect.width < (isMedia ? 8 : 48) || rect.height < (isMedia ? 8 : 28)) continue

    // a tag / button around a single text is one piece, not two
    let inner = null
    if (!isMedia) {
      const texts = [...targetOf.keys()].filter((k) => el.contains(k))
      if (texts.length <= 1) inner = texts.length ? targetOf.get(texts[0]) : 'skip'
    }
    if (inner === 'skip') continue
    const t = inner || {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      color: isMedia ? (tag === 'img' ? accent : cs.color) : cs.borderTopColor,
      r: isMedia ? Math.min(7, 2.5 + Math.sqrt(rect.width * rect.height) / 20) : 4.5,
      card: !isMedia,
    }
    if (!inner) targets.push(t)
    if (!overlaps(rect, vw, vh)) continue

    if (isMedia) {
      // fill the icon / image with a loose grid
      const step = Math.max(3, Math.sqrt((rect.width * rect.height) / 60))
      for (let x = rect.left + step / 2; x < rect.right; x += step) {
        for (let y = rect.top + step / 2; y < rect.bottom; y += step) addDust(t, x, y, 2)
      }
    } else {
      // trace the card's outline
      const per = 2 * (rect.width + rect.height)
      const step = 7
      for (let d = 0; d < per; d += step) {
        let x, y
        if (d < rect.width) { x = rect.left + d; y = rect.top }
        else if (d < rect.width + rect.height) { x = rect.right; y = rect.top + d - rect.width }
        else if (d < 2 * rect.width + rect.height) { x = rect.right - (d - rect.width - rect.height); y = rect.bottom }
        else { x = rect.left; y = rect.bottom - (d - 2 * rect.width - rect.height) }
        addDust(t, x, y, 1.6)
      }
    }
  }

  // keep the dust count manageable on very dense screens
  const kept = dust.length > MAX_DUST ? dust.filter(() => Math.random() < MAX_DUST / dust.length) : dust
  return { targets, dust: kept }
}
