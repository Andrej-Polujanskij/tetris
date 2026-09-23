<script setup lang="ts">
import { ref } from 'vue'

import { useCanvasSurface } from '@/composables/useCanvasSurface'
import type { SurfaceKey } from '@/game/types'

const props = defineProps<{
  surfaceKey: Extract<SurfaceKey, 'next' | 'hold'>
  label: string
  hint?: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)

useCanvasSurface(canvas, props.surfaceKey)
</script>

<template>
  <section class="preview">
    <span class="preview__label">{{ label }}</span>
    <canvas ref="canvas"></canvas>
    <small v-if="hint">{{ hint }}</small>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;
@use '@/assets/styles/mixins' as *;

.preview {
  @include panel-card;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &__label {
    @include caption-label;
  }

  canvas {
    width: 120px;
    height: 120px;
  }

  small {
    color: $muted;
    font-size: 0.75rem;
  }
}

@media (max-width: $breakpoint-compact) {
  .preview {
    flex-direction: row;
    justify-content: center;
    gap: 8px;
    padding: 6px 10px;

    canvas {
      width: 44px;
      height: 44px;
    }

    small {
      display: none;
    }
  }
}
</style>
