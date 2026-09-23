export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export type Cell = PieceType | null

export type Grid = Cell[][]

export type Matrix = number[][]

export type Rotation = 0 | 1 | 2 | 3

export type RotationDirection = 1 | -1

export type Phase = 'idle' | 'playing' | 'paused' | 'over'

export type SurfaceKey = 'board' | 'next' | 'hold'

export interface Piece {
  type: PieceType
  matrix: Matrix
  rot: Rotation
  x: number
  y: number
}

export interface Stats {
  score: number
  lines: number
  level: number
}

export interface GameState extends Stats {
  grid: Grid
  bag: PieceType[]
  bagIndex: number
  current: Piece | null
  next: Piece | null
  hold: Piece | null
  canHold: boolean
  dropMs: number
  acc: number
  /** null means: take the next frame timestamp as a fresh reference point. */
  lastTs: number | null
  phase: Phase
}
