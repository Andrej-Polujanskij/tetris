<script setup lang="ts">
import { useGameControls, useGameState } from '@/composables/useGame'
import { vPress } from '@/directives/press'

const { canHold } = useGameState()
const { move, softDrop, rotate, hold, hardDrop } = useGameControls()
</script>

<template>
  <div class="touch-controls">
    <div class="tc-zone tc-zone--move">
      <button v-press.repeat="() => move(-1)" type="button" class="tc-btn" aria-label="Move left">
        <svg viewBox="0 0 24 24"><path d="M15 4 5 12l10 8z"></path></svg>
      </button>
      <button v-press.repeat="softDrop" type="button" class="tc-btn" aria-label="Soft drop">
        <svg viewBox="0 0 24 24"><path d="M4 9h16l-8 10z"></path></svg>
      </button>
      <button v-press.repeat="() => move(1)" type="button" class="tc-btn" aria-label="Move right">
        <svg viewBox="0 0 24 24"><path d="M9 4l10 8-10 8z"></path></svg>
      </button>
    </div>

    <div class="tc-zone tc-zone--action">
      <button
        v-press="hold"
        type="button"
        class="tc-btn tc-btn--sat tc-btn--hold"
        :class="{ 'is-used': !canHold }"
        aria-label="Hold piece"
      >
        HOLD
      </button>
      <button
        v-press="() => rotate(1)"
        type="button"
        class="tc-btn tc-btn--rotate"
        aria-label="Rotate"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"></path>
        </svg>
      </button>
      <button
        v-press="hardDrop"
        type="button"
        class="tc-btn tc-btn--sat tc-btn--drop"
        aria-label="Hard drop"
      >
        DROP
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.touch-controls {
  display: none;
}

@media (max-width: $breakpoint-compact) {
  .touch-controls {
    display: flex;
    flex: 0 0 auto;
    gap: 12px;
    margin: 10px -14px 0;
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
    background: $panel;
    border-top: 1px solid $line;
    backdrop-filter: blur(10px);
  }

  .tc-zone {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tc-btn {
    flex: 1 1 0;
    min-width: 0;
    max-width: 58px;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border: 1px solid $line;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
    color: $text;
    font-family: $font-mono;
    cursor: pointer;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    transition:
      transform 0.08s ease,
      box-shadow 0.08s ease,
      background 0.08s ease,
      opacity 0.15s ease;

    svg {
      width: 42%;
      height: 42%;
      fill: $cyan;
    }

    &.is-active {
      background: rgba(92, 225, 255, 0.16);
      box-shadow:
        0 0 0 1px $cyan,
        0 0 16px rgba(92, 225, 255, 0.4);
      transform: scale(0.94);
    }
  }

  .tc-btn--rotate {
    flex: 1.5 1 0;
    max-width: 70px;
    border-radius: 50%;
    border: 0;
    background: linear-gradient(180deg, #9af0ff, $cyan 55%, #2aa8d8);
    box-shadow: 0 8px 22px rgba(92, 225, 255, 0.35);

    svg {
      width: 40%;
      height: 40%;
      fill: #041018;
    }

    &.is-active {
      transform: scale(0.92);
      box-shadow: 0 4px 14px rgba(92, 225, 255, 0.5);
    }
  }

  .tc-btn--sat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    max-width: 50px;
    aspect-ratio: auto;
    height: 46px;
    border-radius: 10px;
    font-family: $font-display;
    font-size: 0.56rem;
    letter-spacing: 0.08em;
  }

  .tc-btn--hold {
    color: $gold;
    border-color: rgba(255, 209, 102, 0.4);

    &.is-active {
      background: rgba(255, 209, 102, 0.14);
      box-shadow: 0 0 0 1px $gold;
      transform: scale(0.94);
    }

    &.is-used {
      opacity: 0.42;
    }
  }

  .tc-btn--drop {
    color: $danger;
    border-color: rgba(255, 93, 122, 0.4);

    &.is-active {
      background: rgba(255, 93, 122, 0.16);
      box-shadow: 0 0 0 1px $danger;
      transform: scale(0.94);
    }
  }
}
</style>
