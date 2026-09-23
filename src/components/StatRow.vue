<script setup lang="ts">
import { useTetris } from '@/composables/useTetris'

const { score, lines, level } = useTetris()
</script>

<template>
  <div class="stat-row">
    <section class="stat">
      <span class="stat__label">Score</span>
      <strong class="stat__value">{{ score }}</strong>
    </section>
    <section class="stat">
      <span class="stat__label">Lines</span>
      <strong class="stat__value">{{ lines }}</strong>
    </section>
    <section class="stat">
      <span class="stat__label">Level</span>
      <strong class="stat__value">{{ level }}</strong>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;
@use '@/assets/styles/mixins' as *;

.stat-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stat {
  @include panel-card;

  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label {
    @include caption-label;
  }

  &__value {
    font-family: $font-display;
    font-size: 1.6rem;
    color: $gold;
  }
}

@media (max-width: $breakpoint-compact) {
  .stat-row {
    grid-area: stats;
    flex-direction: row;
    gap: 8px;
  }

  .stat {
    flex: 1 1 0;
    min-width: 0;
    align-items: center;
    padding: 8px 10px;

    &__value {
      font-size: 1.25rem;
    }
  }
}
</style>
