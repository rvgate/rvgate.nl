import { ref } from 'vue'

// Shared state for the "catch the website" mini game.
const playing = ref(false)

export function useGame() {
  return {
    playing,
    startGame: () => { playing.value = true },
    stopGame: () => { playing.value = false },
  }
}
