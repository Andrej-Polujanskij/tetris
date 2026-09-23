import { computed, readonly, ref, watch } from 'vue'

import { createEngine } from '@/game/engine'
import { createRenderer } from '@/game/renderer'
import type { Phase, RotationDirection, SurfaceKey } from '@/game/types'

export interface OverlayContent {
  title: string
  text: string
  button: string
}

const engine = createEngine()
const renderer = createRenderer(engine)

const score = ref(0)
const lines = ref(0)
const level = ref(1)
const phase = ref<Phase>('idle')
const canHold = ref(true)

engine.listeners.onStats = (stats) => {
  score.value = stats.score
  lines.value = stats.lines
  level.value = stats.level
}
engine.listeners.onPhase = (value) => {
  phase.value = value
}
engine.listeners.onHoldAvailability = (value) => {
  canHold.value = value
}

function overlayContentFor(value: Exclude<Phase, 'playing'>): OverlayContent {
  switch (value) {
    case 'idle':
      return { title: 'TETRIS', text: 'Press Enter to start', button: 'Play' }
    case 'paused':
      return { title: 'PAUSED', text: 'Press P or the button to continue', button: 'Resume' }
    case 'over':
      return { title: 'GAME OVER', text: `Score: ${score.value}`, button: 'Play again' }
  }
}

const overlayContent = ref<OverlayContent>(overlayContentFor('idle'))
const overlayVisible = computed(() => phase.value !== 'playing')

// Keep the content while playing so the text does not vanish mid fade-out.
watch(phase, (value) => {
  if (value === 'playing') return
  overlayContent.value = overlayContentFor(value)
})

let rafId = 0
let running = false

function frame(ts: number): void {
  engine.advance(ts)
  renderer.draw()
  rafId = requestAnimationFrame(frame)
}

function startLoop(): void {
  if (running) return
  running = true
  rafId = requestAnimationFrame(frame)
}

function stopLoop(): void {
  if (!running) return
  running = false
  cancelAnimationFrame(rafId)
  rafId = 0
}

function registerSurface(key: SurfaceKey, ctx: CanvasRenderingContext2D | null): void {
  renderer.setSurface(key, ctx)
}

function primaryAction(): void {
  if (phase.value === 'paused') engine.togglePause()
  else engine.start()
}

function requestStart(): void {
  if (phase.value === 'idle' || phase.value === 'over') engine.start()
}

function togglePause(): void {
  if (phase.value === 'idle' || phase.value === 'over') return
  engine.togglePause()
}

export function useTetris() {
  return {
    score: readonly(score),
    lines: readonly(lines),
    level: readonly(level),
    phase: readonly(phase),
    canHold: readonly(canHold),
    overlayContent: readonly(overlayContent),
    overlayVisible,
    isPlaying: computed(() => phase.value === 'playing'),
    move: (dx: number) => engine.move(dx),
    rotate: (dir: RotationDirection) => engine.rotate(dir),
    softDrop: () => engine.softDrop(),
    hardDrop: () => engine.hardDrop(),
    hold: () => engine.hold(),
    primaryAction,
    requestStart,
    togglePause,
    registerSurface,
    startLoop,
    stopLoop,
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(stopLoop)
}
