// Power-up items: what they look like and how often they show up.
// Icons are 24×24 SVG paths, drawn with the even-odd fill rule both on the
// canvas (via Path2D) and in the HUD (as inline SVG).

export const ICONS = {
  shield: 'M12 2 4 5v6c0 5.2 3.4 9.7 8 11 4.6-1.3 8-5.8 8-11V5l-8-3Zm0 2.2 6 2.2V11c0 4-2.5 7.6-6 8.9V4.2Z',
  push:
    'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z' +
    'M5.64 5.64A9 9 0 0 0 5.64 18.36L7.05 16.95A7 7 0 0 1 7.05 7.05Z' +
    'M18.36 5.64A9 9 0 0 1 18.36 18.36L16.95 16.95A7 7 0 0 0 16.95 7.05Z',
  multishot: 'M12 21 3 6l3-1.5 6 12 6-12L21 6l-9 15ZM11 3h2v11h-2V3Z',
  mine:
    'M12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm-1.5 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z' +
    'M11 1h2v4h-2zM11 19h2v4h-2zM1 11h4v2H1zM19 11h4v2h-4z',
  killall:
    'M12 2C7 2 3 5.6 3 10.5c0 2.9 1.4 5 3.5 6.3V20a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3.2c2.1-1.3 3.5-3.4 3.5-6.3C21 5.6 17 2 12 2Z' +
    'M8.5 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM15.5 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM10.5 15h3l-1.5 2.5-1.5-2.5Z',
  // horseshoe magnet; the thin cut-outs mark the poles
  magnet: 'M4 3h5v8a3 3 0 0 0 6 0V3h5v8a8 8 0 0 1-16 0V3ZM4 6.5h5v1.2H4zM15 6.5h5v1.2h-5z',
  crosshair:
    'M11 2h2v3.07A7 7 0 0 1 18.93 11H22v2h-3.07A7 7 0 0 1 13 18.93V22h-2v-3.07A7 7 0 0 1 5.07 13H2v-2h3.07A7 7 0 0 1 11 5.07V2Z' +
    'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z',
}

/**
 * weight: relative chance to show up; kill-all is the rare ultimate.
 * duration: ms an effect lasts (only for timed items).
 * nameKey: translation key in content.js `ui`.
 */
export const ITEMS = {
  shield: { color: '#2dd4bf', weight: 26, duration: 8000, nameKey: 'itemShield' },
  push: { color: '#818cf8', weight: 26, nameKey: 'itemPush' },
  multishot: { color: '#fb923c', weight: 24, duration: 10000, nameKey: 'itemMultishot' },
  mine: { color: '#f2545b', weight: 21, nameKey: 'itemMine' },
  magnet: { color: '#e879f9', weight: 22, duration: 12000, boost: 3, nameKey: 'itemMagnet' }, // boost: ×3 = +200% range
  killall: { color: '#facc15', weight: 3, nameKey: 'itemKillall' },
}

export function randomItem() {
  const entries = Object.entries(ITEMS)
  let roll = Math.random() * entries.reduce((sum, [, it]) => sum + it.weight, 0)
  for (const [kind, it] of entries) {
    roll -= it.weight
    if (roll <= 0) return kind
  }
  return entries[0][0]
}

const paths = {}
/** Cached Path2D for drawing an icon on a canvas. */
export function iconPath(name) {
  return (paths[name] ??= new Path2D(ICONS[name]))
}
