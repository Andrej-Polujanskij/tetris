import { computed, readonly, ref, watch } from 'vue'

import { createEngine } from '@/game/engine'
import { createRenderer } from '@/game/renderer'
import { GamePhase } from '@/game/types'
import type { RotationDirection, SurfaceKey } from '@/game/types'

export interface OverlayContent {
  title: string
  text: string
  button: string
}

const score = ref(0)
const lines = ref(0)
const level = ref(1)
const phase = ref<GamePhase>(GamePhase.Idle)
const canHold = ref(true)

const engine = createEngine({
  onStats: (stats) => {
    score.value = stats.score
    lines.value = stats.lines
    level.value = stats.level
  },
  onPhase: (value) => {
    phase.value = value
  },
  onHoldAvailability: (value) => {
    canHold.value = value
  },
})
const renderer = createRenderer(engine)

function overlayContentFor(value: Exclude<GamePhase, GamePhase.Playing>): OverlayContent {
  switch (value) {
    case GamePhase.Idle:
      return { title: 'TETRIS', text: 'Press Enter to start', button: 'Play' }
    case GamePhase.Paused:
      return { title: 'PAUSED', text: 'Press P or the button to continue', button: 'Resume' }
    case GamePhase.Over:
      return { title: 'GAME OVER', text: `Score: ${score.value}`, button: 'Play again' }
  }
}

const overlayContent = ref<OverlayContent>(overlayContentFor(GamePhase.Idle))
const overlayVisible = computed(() => phase.value !== GamePhase.Playing)
const isPlaying = computed(() => phase.value === GamePhase.Playing)

// Keep the content while playing so the text does not vanish mid fade-out.
watch(phase, (value) => {
  if (value === GamePhase.Playing) return
  overlayContent.value = overlayContentFor(value)
})

let rafId = 0

function frame(ts: number): void {
  engine.advance(ts)
  renderer.draw()
  rafId = requestAnimationFrame(frame)
}

function startLoop(): void {
  if (rafId) return
  rafId = requestAnimationFrame(frame)
}

function stopLoop(): void {
  cancelAnimationFrame(rafId)
  rafId = 0
}

function startOrResume(): void {
  if (phase.value === GamePhase.Paused) engine.togglePause()
  else engine.start()
}

const state = {
  score: readonly(score),
  lines: readonly(lines),
  level: readonly(level),
  phase: readonly(phase),
  canHold: readonly(canHold),
  overlayContent: readonly(overlayContent),
  overlayVisible,
  isPlaying,
}

const controls = {
  move: (dx: number) => engine.move(dx),
  rotate: (dir: RotationDirection) => engine.rotate(dir),
  softDrop: () => engine.softDrop(),
  hardDrop: () => engine.hardDrop(),
  hold: () => engine.hold(),
  start: () => engine.start(),
  togglePause: () => engine.togglePause(),
  startOrResume,
}

const loop = { startLoop, stopLoop }

/** Everything the UI reads. Read only: the engine is the single writer. */
export function useGameState() {
  return state
}

/** Everything the player can trigger, from the keyboard or the touch buttons. */
export function useGameControls() {
  return controls
}

/** Render loop lifecycle. Only the root component needs this. */
export function useGameLoop() {
  return loop
}

/**
 * Not part of the component-facing API: useCanvasSurface is the only caller,
 * and it is what wires a mounted canvas into the renderer.
 */
export function registerSurface(key: SurfaceKey, ctx: CanvasRenderingContext2D | null): void {
  renderer.setSurface(key, ctx)
}

if (import.meta.hot) {
  import.meta.hot.dispose(stopLoop)
}
