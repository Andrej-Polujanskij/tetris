<script setup lang="ts">
import { ref } from 'vue'

import GameOverlay from '@/components/GameOverlay.vue'
import { useCanvasSurface } from '@/composables/useCanvasSurface'

const canvas = ref<HTMLCanvasElement | null>(null)

useCanvasSurface(canvas, 'board')
</script>

<template>
  <section class="stage">
    <canvas ref="canvas"></canvas>
    <GameOverlay />
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.stage {
  position: relative;
  width: min(300px, 100%);
  aspect-ratio: 1 / 2;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(92, 225, 255, 0.35);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.4),
    0 20px 50px rgba(0, 0, 0, 0.45),
    inset 0 0 40px rgba(92, 225, 255, 0.08);

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    background: #05070e;
  }
}

@media (max-width: $breakpoint-compact) {
  .stage {
    grid-area: stage;
    width: auto;
    height: 100%;
    max-width: 100%;
    justify-self: center;
  }
}
</style>
