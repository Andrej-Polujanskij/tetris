import type { Directive } from 'vue'

const REPEAT_DELAY_MS = 220
const REPEAT_RATE_MS = 70
const ACTIVE_CLASS = 'is-active'

type PressAction = () => void

interface PressState {
  action: PressAction
  destroy: () => void
}

const registry = new WeakMap<HTMLElement, PressState>()

function attach(el: HTMLElement, action: PressAction, repeat: boolean): PressState {
  const state: PressState = { action, destroy: () => {} }

  let delayTimer: ReturnType<typeof setTimeout> | null = null
  let repeatTimer: ReturnType<typeof setInterval> | null = null

  function fire(): void {
    state.action()
  }

  function clearTimers(): void {
    if (delayTimer !== null) clearTimeout(delayTimer)
    if (repeatTimer !== null) clearInterval(repeatTimer)
    delayTimer = null
    repeatTimer = null
  }

  function onPointerDown(event: PointerEvent): void {
    event.preventDefault()
    fire()
    el.classList.add(ACTIVE_CLASS)
    if (!repeat) return
    delayTimer = setTimeout(() => {
      repeatTimer = setInterval(fire, REPEAT_RATE_MS)
    }, REPEAT_DELAY_MS)
  }

  function onPointerEnd(): void {
    clearTimers()
    el.classList.remove(ACTIVE_CLASS)
  }

  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointerup', onPointerEnd)
  el.addEventListener('pointerleave', onPointerEnd)
  el.addEventListener('pointercancel', onPointerEnd)

  state.destroy = () => {
    clearTimers()
    el.classList.remove(ACTIVE_CLASS)
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointerup', onPointerEnd)
    el.removeEventListener('pointerleave', onPointerEnd)
    el.removeEventListener('pointercancel', onPointerEnd)
  }

  return state
}

/**
 * v-press         fires once per press
 * v-press.repeat  while held, repeats the action after 220ms, then every 70ms
 */
export const vPress: Directive<HTMLElement, PressAction> = {
  mounted(el, binding) {
    registry.set(el, attach(el, binding.value, binding.modifiers.repeat === true))
  },
  updated(el, binding) {
    const state = registry.get(el)
    if (state) state.action = binding.value
  },
  beforeUnmount(el) {
    registry.get(el)?.destroy()
    registry.delete(el)
  },
}
