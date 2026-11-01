// A soft, short "ta-da" chime synthesised with the Web Audio API (no audio file).

let audioCtx

export function chime({ volume = 0.06 } = {}) {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  try {
    audioCtx ??= new AC()
    if (audioCtx.state === 'suspended') audioCtx.resume()

    const now = audioCtx.currentTime
    const master = audioCtx.createGain()
    master.gain.value = volume
    master.connect(audioCtx.destination)

    // quick rising arpeggio: C6 – E6 – G6
    ;[1046.5, 1318.5, 1568].forEach((freq, i) => {
      const t = now + i * 0.07
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(1, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.connect(gain).connect(master)
      osc.start(t)
      osc.stop(t + 0.4)
    })
  } catch {
    // audio is a nice-to-have; ignore failures
  }
}
