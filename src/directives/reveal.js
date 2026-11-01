// v-reveal: fade an element in when it scrolls into view.

let observer

function show(el) {
  el.classList.add('visible')
  observer?.unobserve(el)
}

function getObserver() {
  if (observer === undefined) {
    observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => entries.forEach((e) => e.isIntersecting && show(e.target)),
          { threshold: 0.12 },
        )
      : null
  }
  return observer
}

export default {
  mounted(el) {
    const io = getObserver()
    if (!io) return
    el.classList.add('reveal')
    io.observe(el)
    // safety net: never leave content hidden if the observer doesn't fire
    el._revealTimer = setTimeout(() => show(el), 2500)
  },
  unmounted(el) {
    clearTimeout(el._revealTimer)
    observer?.unobserve(el)
  },
}
