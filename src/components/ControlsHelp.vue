<template>
  <section class="help">
    <h3>Controls</h3>
    <ul>
      <li><kbd>&larr;</kbd> <kbd>&rarr;</kbd> move</li>
      <li><kbd>&darr;</kbd> soft drop</li>
      <li><kbd>&uarr;</kbd> / <kbd>X</kbd> rotate</li>
      <li><kbd>Z</kbd> rotate left</li>
      <li><kbd>Space</kbd> hard drop</li>
      <li><kbd>P</kbd> pause</li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;
@use '@/assets/styles/mixins' as *;

.help {
  @include panel-card;

  h3 {
    font-family: $font-display;
    font-size: 0.85rem;
    letter-spacing: 0.12em;
    margin-bottom: 10px;
    color: $cyan;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: $muted;
    font-size: 0.82rem;
  }

  kbd {
    display: inline-block;
    min-width: 1.4em;
    padding: 1px 6px;
    border: 1px solid $line;
    border-bottom-width: 2px;
    border-radius: 6px;
    color: $text;
    background: rgba(255, 255, 255, 0.04);
  }
}

@media (max-width: $breakpoint-compact) {
  .help {
    display: none;
  }
}
</style>
