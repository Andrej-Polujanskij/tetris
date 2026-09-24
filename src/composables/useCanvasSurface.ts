import { onBeforeUnmount, onMounted, type Ref } from 'vue'

import { SURFACE_SIZES } from '@/game/constants'
import type { SurfaceKey } from '@/game/types'

import { registerSurface } from './useGame'

/**
 * Binds a canvas element to the renderer and keeps its resolution in step with its
 * real size: the backing store is the CSS size times devicePixelRatio, and the
 * context is scaled so drawing code keeps working in logical coordinates.
 */
export function useCanvasSurface(canvasRef: Ref<HTMLCanvasElement | null>, key: SurfaceKey): void {
  const logical = SURFACE_SIZES[key]
  let observer: ResizeObserver | null = null

  function applySize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const width = Math.max(1, Math.round(rect.width * dpr))
    const height = Math.max(1, Math.round(rect.height * dpr))

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    ctx.setTransform(width / logical.width, 0, 0, height / logical.height, 0, 0)
  }

  onMounted(() => {
    const canvas = canvasRef.value
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    applySize(canvas, ctx)
    registerSurface(key, ctx)

    observer = new ResizeObserver(() => applySize(canvas, ctx))
    observer.observe(canvas)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    registerSurface(key, null)
  })
}
