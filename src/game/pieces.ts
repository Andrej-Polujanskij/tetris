import { COLS, ROWS } from './constants'
import type { Cell, Grid, Matrix, Piece, PieceType, RotationDirection } from './types'

export const SHAPES: Record<PieceType, Matrix> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

export const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

export function createGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null))
}

export function cloneMatrix(matrix: Matrix): Matrix {
  return matrix.map((row) => row.slice())
}

export function rotateMatrix(matrix: Matrix, dir: RotationDirection): Matrix {
  const size = matrix.length
  const next: Matrix = Array.from({ length: size }, () => Array<number>(size).fill(0))
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (dir > 0) next[x][size - 1 - y] = matrix[y][x]
      else next[size - 1 - x][y] = matrix[y][x]
    }
  }
  return next
}

/** A shuffled set of all seven pieces, so every piece appears once per seven spawns. */
export function shuffledBag(): PieceType[] {
  const types = [...PIECE_TYPES]
  for (let i = types.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[types[i], types[j]] = [types[j], types[i]]
  }
  return types
}

export function spawnPiece(type: PieceType): Piece {
  const matrix = cloneMatrix(SHAPES[type])
  return {
    type,
    matrix,
    rot: 0,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: type === 'I' ? -1 : 0,
  }
}
