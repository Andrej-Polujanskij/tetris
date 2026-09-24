import { onBeforeUnmount, onMounted } from 'vue'

import { useGameControls, useGameState } from './useGame'

type KeyActions = Partial<Record<string, () => void>>

export function useKeyboard(): void {
  const { isPlaying } = useGameState()
  const { move, rotate, softDrop, hardDrop, hold, start, togglePause } = useGameControls()

  const menuKeys: KeyActions = {
    Enter: start,
    p: togglePause,
    P: togglePause,
    Escape: togglePause,
  }

  // Only intercepted while playing, so arrows and space still scroll the page otherwise.
  const gameKeys: KeyActions = {
    ArrowLeft: () => move(-1),
    ArrowRight: () => move(1),
    ArrowDown: softDrop,
    ArrowUp: () => rotate(1),
    x: () => rotate(1),
    X: () => rotate(1),
    z: () => rotate(-1),
    Z: () => rotate(-1),
    ' ': hardDrop,
    c: hold,
    C: hold,
    Shift: hold,
  }

  function onKeydown(event: KeyboardEvent): void {
    const menuAction = menuKeys[event.key]
    if (menuAction) {
      menuAction()
      return
    }

    const gameAction = gameKeys[event.key]
    if (!gameAction || !isPlaying.value) return
    event.preventDefault()
    gameAction()
  }

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}
