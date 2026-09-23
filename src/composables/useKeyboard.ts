import { onBeforeUnmount, onMounted } from 'vue'

import { useTetris } from './useTetris'

const MOVEMENT_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'ArrowUp',
  'x',
  'X',
  'z',
  'Z',
  ' ',
  'c',
  'C',
  'Shift',
])

export function useKeyboard(): void {
  const game = useTetris()

  function onKeydown(event: KeyboardEvent): void {
    const { key } = event

    if (key === 'Enter') {
      game.requestStart()
      return
    }

    if (key === 'p' || key === 'P' || key === 'Escape') {
      game.togglePause()
      return
    }

    if (!game.isPlaying.value || !MOVEMENT_KEYS.has(key)) return
    event.preventDefault()

    switch (key) {
      case 'ArrowLeft':
        game.move(-1)
        break
      case 'ArrowRight':
        game.move(1)
        break
      case 'ArrowDown':
        game.softDrop()
        break
      case 'ArrowUp':
      case 'x':
      case 'X':
        game.rotate(1)
        break
      case 'z':
      case 'Z':
        game.rotate(-1)
        break
      case ' ':
        game.hardDrop()
        break
      default:
        game.hold()
    }
  }

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
}
