import {
  BASE_DROP_MS,
  COLS,
  DROP_MS_PER_LEVEL,
  HARD_DROP_POINTS_PER_ROW,
  LINES_PER_LEVEL,
  MAX_FRAME_MS,
  MIN_DROP_MS,
  ROWS,
  SCORE_TABLE,
  SOFT_DROP_POINTS_PER_ROW,
} from './constants'
import { kicksFor } from './kicks'
import { createGrid, rotateMatrix, shuffledBag, spawnPiece } from './pieces'
import type {
  GameState,
  Matrix,
  Phase,
  Piece,
  PieceType,
  Rotation,
  RotationDirection,
  Stats,
} from './types'

const NEXT_ROTATION: Record<RotationDirection, Record<Rotation, Rotation>> = {
  1: { 0: 1, 1: 2, 2: 3, 3: 0 },
  [-1]: { 0: 3, 1: 0, 2: 1, 3: 2 },
}

export interface EngineListeners {
  onStats: (stats: Stats) => void
  onPhase: (phase: Phase) => void
  onHoldAvailability: (canHold: boolean) => void
}

export interface Engine {
  /** Skirta tik skaitymui: renderer nuo cia ima ka piesti. */
  readonly state: GameState
  readonly listeners: EngineListeners
  start(): void
  togglePause(): void
  move(dx: number): void
  softDrop(): void
  hardDrop(): void
  rotate(dir: RotationDirection): void
  hold(): void
  advance(ts: number): void
  ghostY(): number
  isPlaying(): boolean
}

const noop = (): void => {}

export function createEngine(): Engine {
  const state: GameState = {
    grid: createGrid(),
    bag: [],
    bagIndex: 0,
    current: null,
    next: null,
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    dropMs: BASE_DROP_MS,
    acc: 0,
    lastTs: null,
    phase: 'idle',
  }

  const listeners: EngineListeners = {
    onStats: noop,
    onPhase: noop,
    onHoldAvailability: noop,
  }

  function emitStats(): void {
    listeners.onStats({ score: state.score, lines: state.lines, level: state.level })
  }

  function setPhase(phase: Phase): void {
    if (state.phase === phase) return
    state.phase = phase
    listeners.onPhase(phase)
  }

  function setCanHold(canHold: boolean): void {
    if (state.canHold === canHold) return
    state.canHold = canHold
    listeners.onHoldAvailability(canHold)
  }

  function takeFromBag(): PieceType {
    if (state.bagIndex >= state.bag.length) {
      state.bag = shuffledBag()
      state.bagIndex = 0
    }
    const type = state.bag[state.bagIndex]
    state.bagIndex += 1
    return type
  }

  function collide(piece: Piece, ox = 0, oy = 0, matrix: Matrix = piece.matrix): boolean {
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (!matrix[y][x]) continue
        const nx = piece.x + x + ox
        const ny = piece.y + y + oy
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true
        if (ny >= 0 && state.grid[ny][nx]) return true
      }
    }
    return false
  }

  function tryMove(dx: number, dy: number): boolean {
    const piece = state.current
    if (!piece || collide(piece, dx, dy)) return false
    piece.x += dx
    piece.y += dy
    return true
  }

  function gameOver(): void {
    setPhase('over')
  }

  /**
   * Uzfiksuoja figura krovoje. Pirma patikrina, ar nors vienas langelis lieka virs lentos:
   * tokiu atveju zaidimas baigtas ir i grida nerasoma nieko.
   */
  function lockPiece(): void {
    const piece = state.current
    if (!piece) return

    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (!piece.matrix[y][x]) continue
        if (piece.y + y < 0) {
          gameOver()
          return
        }
      }
    }

    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (!piece.matrix[y][x]) continue
        state.grid[piece.y + y][piece.x + x] = piece.type
      }
    }

    clearLines()
    spawnNext()
  }

  function clearLines(): void {
    let cleared = 0
    for (let y = ROWS - 1; y >= 0; y -= 1) {
      if (state.grid[y].every(Boolean)) {
        state.grid.splice(y, 1)
        state.grid.unshift(Array(COLS).fill(null))
        cleared += 1
        y += 1
      }
    }
    if (!cleared) return

    state.lines += cleared
    state.score += SCORE_TABLE[cleared] * state.level

    const newLevel = Math.floor(state.lines / LINES_PER_LEVEL) + 1
    if (newLevel !== state.level) {
      state.level = newLevel
      state.dropMs = Math.max(MIN_DROP_MS, BASE_DROP_MS - (state.level - 1) * DROP_MS_PER_LEVEL)
    }
    emitStats()
  }

  function spawnNext(): void {
    state.current = state.next
    state.next = spawnPiece(takeFromBag())
    setCanHold(true)
    if (state.current && collide(state.current)) gameOver()
  }

  function ghostY(): number {
    const piece = state.current
    if (!piece) return 0
    let offset = 0
    while (!collide(piece, 0, offset + 1)) offset += 1
    return piece.y + offset
  }

  function isPlaying(): boolean {
    return state.phase === 'playing'
  }

  function reset(): void {
    state.grid = createGrid()
    state.bag = []
    state.bagIndex = 0
    state.score = 0
    state.lines = 0
    state.level = 1
    state.dropMs = BASE_DROP_MS
    state.acc = 0
    state.lastTs = null
    state.hold = null
    setCanHold(true)
    state.current = spawnPiece(takeFromBag())
    state.next = spawnPiece(takeFromBag())
    emitStats()
  }

  function start(): void {
    reset()
    setPhase('playing')
  }

  function togglePause(): void {
    if (state.phase === 'playing') {
      setPhase('paused')
      return
    }
    if (state.phase === 'paused') {
      state.lastTs = null
      setPhase('playing')
    }
  }

  function move(dx: number): void {
    if (!isPlaying()) return
    tryMove(dx, 0)
  }

  function softDrop(): void {
    if (!isPlaying()) return
    if (!tryMove(0, 1)) {
      lockPiece()
      return
    }
    state.score += SOFT_DROP_POINTS_PER_ROW
    emitStats()
  }

  function hardDrop(): void {
    if (!isPlaying()) return
    let distance = 0
    while (tryMove(0, 1)) distance += 1
    state.score += distance * HARD_DROP_POINTS_PER_ROW
    emitStats()
    lockPiece()
  }

  function rotate(dir: RotationDirection): void {
    if (!isPlaying()) return
    const piece = state.current
    if (!piece || piece.type === 'O') return

    const from = piece.rot
    const to = NEXT_ROTATION[dir][from]
    const rotated = rotateMatrix(piece.matrix, dir)

    for (const [kx, ky] of kicksFor(piece.type, from, dir)) {
      if (collide(piece, kx, -ky, rotated)) continue
      piece.matrix = rotated
      piece.rot = to
      piece.x += kx
      piece.y -= ky
      return
    }
  }

  function hold(): void {
    if (!isPlaying() || !state.canHold || !state.current) return

    const held = state.hold
    state.hold = spawnPiece(state.current.type)
    state.current = held ? spawnPiece(held.type) : state.next
    if (!held) state.next = spawnPiece(takeFromBag())
    setCanHold(false)
    if (state.current && collide(state.current)) gameOver()
  }

  function advance(ts: number): void {
    if (!isPlaying()) return

    if (state.lastTs === null) {
      state.lastTs = ts
      return
    }

    state.acc += Math.min(ts - state.lastTs, MAX_FRAME_MS)
    state.lastTs = ts

    while (state.acc >= state.dropMs) {
      state.acc -= state.dropMs
      if (!tryMove(0, 1)) {
        lockPiece()
        break
      }
    }
  }

  return {
    state,
    listeners,
    start,
    togglePause,
    move,
    softDrop,
    hardDrop,
    rotate,
    hold,
    advance,
    ghostY,
    isPlaying,
  }
}
