import type { PieceType, SurfaceKey } from './types'

export const COLS = 10
export const ROWS = 20
export const BLOCK = 30
export const LINES_PER_LEVEL = 10

export const BASE_DROP_MS = 1000
export const MIN_DROP_MS = 90
export const DROP_MS_PER_LEVEL = 85

/**
 * Longest step a single frame may take. Prevents a burst of drops when a
 * background tab resumes.
 */
export const MAX_FRAME_MS = 100

export const PREVIEW_BLOCK = 24

export const SCORE_TABLE = [0, 100, 300, 500, 800]

export const HARD_DROP_POINTS_PER_ROW = 2
export const SOFT_DROP_POINTS_PER_ROW = 1

export const COLORS: Record<PieceType, string> = {
  I: '#5ce1ff',
  O: '#ffd166',
  T: '#c77dff',
  S: '#80ed99',
  Z: '#ff5d7a',
  J: '#4ea8de',
  L: '#ff9f1c',
}

export interface SurfaceSize {
  width: number
  height: number
}

/**
 * Logical size of each canvas. Drawing code always works in these coordinates,
 * while the real pixel count follows the element size and devicePixelRatio.
 */
export const SURFACE_SIZES: Record<SurfaceKey, SurfaceSize> = {
  board: { width: COLS * BLOCK, height: ROWS * BLOCK },
  next: { width: 120, height: 120 },
  hold: { width: 120, height: 120 },
}
