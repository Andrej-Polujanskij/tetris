import { BLOCK, COLORS, COLS, PREVIEW_BLOCK, ROWS, SURFACE_SIZES } from './constants'
import type { Engine } from './engine'
import type { Piece, SurfaceKey } from './types'

type Surfaces = Partial<Record<SurfaceKey, CanvasRenderingContext2D>>

export interface Renderer {
  setSurface(key: SurfaceKey, ctx: CanvasRenderingContext2D | null): void
  draw(): void
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha = 1,
  size = BLOCK,
): void {
  ctx.save()
  ctx.globalAlpha = alpha
  const px = x * size
  const py = y * size
  const grad = ctx.createLinearGradient(px, py, px + size, py + size)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.18, color)
  grad.addColorStop(1, '#0b1220')
  ctx.fillStyle = grad
  ctx.fillRect(px + 1, py + 1, size - 2, size - 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3)
  ctx.restore()
}

export function createRenderer(engine: Engine): Renderer {
  const surfaces: Surfaces = {}

  function setSurface(key: SurfaceKey, ctx: CanvasRenderingContext2D | null): void {
    if (ctx) surfaces[key] = ctx
    else delete surfaces[key]
  }

  function drawBoard(ctx: CanvasRenderingContext2D): void {
    const { width, height } = SURFACE_SIZES.board
    const { state } = engine

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#05070e'
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(120, 220, 255, 0.06)'
    for (let x = 0; x <= COLS; x += 1) {
      ctx.beginPath()
      ctx.moveTo(x * BLOCK, 0)
      ctx.lineTo(x * BLOCK, height)
      ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y += 1) {
      ctx.beginPath()
      ctx.moveTo(0, y * BLOCK)
      ctx.lineTo(width, y * BLOCK)
      ctx.stroke()
    }

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const type = state.grid[y][x]
        if (type) drawCell(ctx, x, y, COLORS[type])
      }
    }

    const piece = state.current
    if (!piece) return

    const ghost = engine.ghostY()
    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (!piece.matrix[y][x]) continue
        drawCell(ctx, piece.x + x, ghost + y, COLORS[piece.type], 0.18)
      }
    }
    for (let y = 0; y < piece.matrix.length; y += 1) {
      for (let x = 0; x < piece.matrix[y].length; x += 1) {
        if (!piece.matrix[y][x]) continue
        drawCell(ctx, piece.x + x, piece.y + y, COLORS[piece.type])
      }
    }
  }

  function drawPreview(ctx: CanvasRenderingContext2D, key: SurfaceKey, piece: Piece | null): void {
    const { width, height } = SURFACE_SIZES[key]
    ctx.clearRect(0, 0, width, height)
    if (!piece) return

    const cols = piece.matrix[0].length
    const rows = piece.matrix.length
    const ox = (width / PREVIEW_BLOCK - cols) / 2
    const oy = (height / PREVIEW_BLOCK - rows) / 2

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        if (!piece.matrix[y][x]) continue
        drawCell(ctx, ox + x, oy + y, COLORS[piece.type], 1, PREVIEW_BLOCK)
      }
    }
  }

  function draw(): void {
    if (surfaces.board) drawBoard(surfaces.board)
    if (surfaces.next) drawPreview(surfaces.next, 'next', engine.state.next)
    if (surfaces.hold) drawPreview(surfaces.hold, 'hold', engine.state.hold)
  }

  return { setSurface, draw }
}
