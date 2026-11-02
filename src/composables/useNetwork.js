// Tiny bridge between components and the animated network background:
// anything can drop a "message" node into the network at a screen position.

const listeners = new Set()

/** Called by NetworkBackground; returns an unsubscribe function. */
export function onMessageNode(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Add a pulsing node at viewport coordinates (x, y). */
export function addMessageNode(x, y) {
  listeners.forEach((fn) => fn(x, y))
}
