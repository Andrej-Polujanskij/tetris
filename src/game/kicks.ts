import type { PieceType, Rotation, RotationDirection } from './types'

export type Kick = readonly [number, number]

export interface KickPair {
  cw: readonly Kick[]
  ccw: readonly Kick[]
}

/**
 * Super Rotation System atsistumimo bandymai, sugrupuoti pagal dabartinę orientaciją
 * ir sukimo kryptį. Pirmas bandymas visada [0, 0], t.y. sukimas vietoje.
 */
export type KickTable = Record<Rotation, KickPair>

const JLSTZ: KickTable = {
  0: {
    cw: [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    ccw: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
  },
  1: {
    cw: [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    ccw: [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
  },
  2: {
    cw: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
    ccw: [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
  },
  3: {
    cw: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    ccw: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
  },
}

const I: KickTable = {
  0: {
    cw: [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    ccw: [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
  },
  1: {
    cw: [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
    ccw: [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
  },
  2: {
    cw: [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    ccw: [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
  },
  3: {
    cw: [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
    ccw: [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
  },
}

export function kicksFor(
  type: PieceType,
  from: Rotation,
  dir: RotationDirection,
): readonly Kick[] {
  const pair = type === 'I' ? I[from] : JLSTZ[from]
  return dir > 0 ? pair.cw : pair.ccw
}
