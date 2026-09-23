<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

import BoardCanvas from '@/components/BoardCanvas.vue'
import ControlsHelp from '@/components/ControlsHelp.vue'
import GameHeader from '@/components/GameHeader.vue'
import PiecePreview from '@/components/PiecePreview.vue'
import StatRow from '@/components/StatRow.vue'
import TouchControls from '@/components/TouchControls.vue'
import { useKeyboard } from '@/composables/useKeyboard'
import { useTetris } from '@/composables/useTetris'

const { startLoop, stopLoop } = useTetris()

useKeyboard()

onMounted(startLoop)
onBeforeUnmount(stopLoop)
</script>

<template>
  <div class="app">
    <GameHeader />

    <main class="layout">
      <aside class="panel panel--left">
        <StatRow />
        <PiecePreview class="preview--hold" surface-key="hold" label="Hold" hint="C / Shift" />
      </aside>

      <BoardCanvas />

      <aside class="panel panel--right">
        <PiecePreview class="preview--next" surface-key="next" label="Next" />
        <ControlsHelp />
      </aside>
    </main>

    <TouchControls />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.app {
  max-width: 980px;
  margin: 0 auto;
  padding: 28px 16px 40px;
}

.layout {
  display: grid;
  grid-template-columns: 180px minmax(280px, 300px) 180px;
  gap: 18px;
  justify-content: center;
  align-items: start;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (max-width: $breakpoint-compact) {
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    padding: 14px 14px 0;
    overflow: hidden;
  }

  .layout {
    flex: 1 1 auto;
    min-height: 0;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'stats stats'
      'stage stage'
      'hold  next';
    gap: 8px;
  }

  .panel--left,
  .panel--right {
    display: contents;
  }

  .preview--hold {
    grid-area: hold;
  }

  .preview--next {
    grid-area: next;
  }
}
</style>
