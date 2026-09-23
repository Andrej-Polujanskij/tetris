import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

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

  let ctx: CanvasRenderingContext2D | null = null
  let observer: ResizeObserver | null = null

  function applySize(canvas: HTMLCanvasElement): void {
    if (!ctx) return

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

  function attach(canvas: HTMLCanvasElement): void {
    ctx = canvas.getContext('2d')
    if (!ctx) return

    applySize(canvas)
    registerSurface(key, ctx)

    observer = new ResizeObserver(() => applySize(canvas))
    observer.observe(canvas)
  }

  function detach(): void {
    observer?.disconnect()
    observer = null
    ctx = null
    registerSurface(key, null)
  }

  onMounted(() => {
    if (canvasRef.value) attach(canvasRef.value)
  })

  watch(canvasRef, (canvas, previous) => {
    if (previous) detach()
    if (canvas) attach(canvas)
  })

  onBeforeUnmount(detach)
}
