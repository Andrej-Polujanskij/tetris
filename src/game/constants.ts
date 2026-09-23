import type { PieceType, SurfaceKey } from './types'

export const COLS = 10
export const ROWS = 20
export const BLOCK = 30
export const LINES_PER_LEVEL = 10

export const BASE_DROP_MS = 1000
export const MIN_DROP_MS = 90
export const DROP_MS_PER_LEVEL = 85

/** Ilgiausias vieno kadro zingsnis. Apsaugo nuo kritimu lavinos grizus i uzfonine korteli. */
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
 * Loginis kiekvieno canvas dydis. Piesimo kodas visada dirba siomis koordinatemis,
 * o realus pikseliu kiekis parenkamas pagal elemento dydi ir devicePixelRatio.
 */
export const SURFACE_SIZES: Record<SurfaceKey, SurfaceSize> = {
  board: { width: COLS * BLOCK, height: ROWS * BLOCK },
  next: { width: 120, height: 120 },
  hold: { width: 120, height: 120 },
}
