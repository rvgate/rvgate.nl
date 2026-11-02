// Small sound effects synthesised with the Web Audio API (no audio files).
// Audio is a nice-to-have: every function silently does nothing on failure.

let audioCtx

function audio() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  audioCtx ??= new AC()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

/** One oscillator note with a pitch slide and a quick decay. */
function tone({ freq, to = freq, type = 'sine', dur = 0.12, volume = 0.04, at = 0 }) {
  try {
    const ac = audio()
    if (!ac) return
    const t = ac.currentTime + at
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(to, t + dur * 0.8)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, t + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(gain).connect(ac.destination)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  } catch {
    // ignore
  }
}

/** A soft, short "ta-da": quick rising arpeggio C6 – E6 – G6. */
export function chime({ volume = 0.06 } = {}) {
  ;[1046.5, 1318.5, 1568].forEach((freq, i) => tone({ freq, dur: 0.35, volume, at: i * 0.07 }))
}

/** A tiny "pop" for catching something; `step` raises the pitch for combos. */
export function blip({ step = 0, volume = 0.035 } = {}) {
  const freq = 520 * 2 ** (Math.min(step, 24) / 12) // one semitone up per combo step
  tone({ freq, to: freq * 1.5, type: 'triangle', dur: 0.12, volume })
}

/** Laser shot. */
export function zap() {
  tone({ freq: 1400, to: 300, type: 'square', dur: 0.08, volume: 0.012 })
}

/** Getting hit. */
export function hurt() {
  tone({ freq: 220, to: 55, type: 'sawtooth', dur: 0.28, volume: 0.05 })
}

/** Picking up health: two quick rising notes. */
export function heal() {
  tone({ freq: 660, to: 880, type: 'sine', dur: 0.12, volume: 0.05 })
  tone({ freq: 990, to: 1320, type: 'sine', dur: 0.16, volume: 0.05, at: 0.08 })
}

/** Explosion: a burst of filtered noise. */
export function boom({ big = false } = {}) {
  try {
    const ac = audio()
    if (!ac) return
    const dur = big ? 0.9 : 0.3
    const buffer = ac.createBuffer(1, Math.round(ac.sampleRate * dur), ac.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2
    const src = ac.createBufferSource()
    src.buffer = buffer
    const filter = ac.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = big ? 900 : 1600
    const gain = ac.createGain()
    gain.gain.value = big ? 0.22 : 0.08
    src.connect(filter).connect(gain).connect(ac.destination)
    src.start()
  } catch {
    // ignore
  }
}

/** Grabbing an item. */
export function pickup() {
  tone({ freq: 880, to: 1760, type: 'triangle', dur: 0.1, volume: 0.04 })
  tone({ freq: 1320, to: 2200, type: 'triangle', dur: 0.12, volume: 0.03, at: 0.06 })
}

/** Activating an item: a rising sweep. */
export function powerUp() {
  tone({ freq: 300, to: 1200, type: 'sawtooth', dur: 0.3, volume: 0.03 })
}

/** Push wave: a deep whoosh. */
export function whoosh() {
  tone({ freq: 420, to: 50, type: 'triangle', dur: 0.4, volume: 0.09 })
}

/** Dropping a mine. */
export function clunk() {
  tone({ freq: 160, to: 120, type: 'square', dur: 0.08, volume: 0.03 })
}

/** Level up: a longer, brighter fanfare. */
export function fanfare() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
    tone({ freq, type: 'triangle', dur: i === 3 ? 0.5 : 0.18, volume: 0.05, at: i * 0.1 }))
}

/** Trying to use an empty slot. */
export function nope() {
  tone({ freq: 180, to: 140, type: 'square', dur: 0.1, volume: 0.02 })
}
