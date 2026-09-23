<script setup lang="ts">
import { useTetris } from '@/composables/useTetris'
import { vPress } from '@/directives/press'

const { phase, togglePause } = useTetris()
</script>

<template>
  <header class="brand">
    <h1>TETRIS</h1>
    <p>classic on HTML · SCSS · JS</p>
    <button
      v-press.unguarded="togglePause"
      type="button"
      class="pause-btn"
      :class="{ 'is-paused': phase === 'paused' }"
      aria-label="Pause"
    >
      <svg class="pause-btn__icon pause-btn__icon--pause" viewBox="0 0 24 24">
        <path d="M7 5h4v14H7zM13 5h4v14h-4z"></path>
      </svg>
      <svg class="pause-btn__icon pause-btn__icon--play" viewBox="0 0 24 24">
        <path d="M8 5l11 7-11 7z"></path>
      </svg>
    </button>
  </header>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.brand {
  text-align: center;
  margin-bottom: 22px;

  h1 {
    font-family: $font-display;
    letter-spacing: 0.42em;
    font-size: clamp(2rem, 5vw, 3.4rem);
    text-indent: 0.42em;
    background: linear-gradient(180deg, #fff 10%, $cyan 70%, #2a8cff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 28px rgba(92, 225, 255, 0.25);
  }

  p {
    margin-top: 6px;
    color: $muted;
    letter-spacing: 0.08em;
    font-size: 0.9rem;
  }
}

.pause-btn {
  display: none;
}

@media (max-width: $breakpoint-compact) {
  .brand {
    flex: 0 0 auto;
    position: relative;
    margin-bottom: 10px;

    h1 {
      font-size: 1.6rem;
      letter-spacing: 0.3em;
      text-indent: 0.3em;
    }

    p {
      display: none;
    }
  }

  .pause-btn {
    display: grid;
    place-items: center;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 38px;
    height: 38px;
    border: 1px solid $line;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease,
      background 0.08s ease;

    &__icon {
      grid-area: 1 / 1;
      width: 16px;
      height: 16px;
      fill: $cyan;
    }

    &__icon--play {
      display: none;
    }

    &.is-paused &__icon--pause {
      display: none;
    }

    &.is-paused &__icon--play {
      display: block;
    }

    &.is-active {
      background: rgba(92, 225, 255, 0.16);
      box-shadow: 0 0 0 1px $cyan;
      transform: translateY(-50%) scale(0.94);
    }
  }
}
</style>
