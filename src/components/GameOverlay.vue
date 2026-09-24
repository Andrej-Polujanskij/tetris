<script setup lang="ts">
import { useGameControls, useGameState } from '@/composables/useGame'

const { overlayContent, overlayVisible } = useGameState()
const { startOrResume } = useGameControls()
</script>

<template>
  <div class="overlay" :class="{ 'is-hidden': !overlayVisible }">
    <div class="overlay__card">
      <h2>{{ overlayContent.title }}</h2>
      <p>{{ overlayContent.text }}</p>
      <button type="button" @click="startOrResume">{{ overlayContent.button }}</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  background: rgba(4, 8, 16, 0.72);
  backdrop-filter: blur(4px);
  transition: opacity 0.2s ease;

  &.is-hidden {
    opacity: 0;
    pointer-events: none;
  }

  &__card {
    text-align: center;
    padding: 22px;
  }

  h2 {
    font-family: $font-display;
    letter-spacing: 0.28em;
    margin-bottom: 10px;
    color: $cyan;
  }

  p {
    color: $muted;
    margin-bottom: 16px;
  }

  button {
    font-family: $font-display;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    border: 0;
    border-radius: 999px;
    padding: 10px 22px;
    color: #041018;
    background: linear-gradient(180deg, #9af0ff, $cyan 55%, #2aa8d8);
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(92, 225, 255, 0.35);

    &:hover {
      transform: translateY(-1px);
    }
  }
}

@media (max-width: $breakpoint-compact) {
  .overlay {
    &__card {
      padding: 12px;
    }

    h2 {
      font-size: clamp(0.9rem, 8vw, 1.4rem);
      letter-spacing: 0.16em;
    }

    p {
      font-size: 0.76rem;
    }
  }
}
</style>
