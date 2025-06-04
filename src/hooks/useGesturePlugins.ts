import { useEffect } from 'react'

export interface GestureEvent {
  clientX: number
  clientY: number
  pointerType: 'mouse' | 'touch' | 'pen'
  pressure: number
  button: number
  shiftKey: boolean
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  originalEvent: Event
}

export interface GesturePlugin {
  onDown?(e: GestureEvent): void
  onMove?(e: GestureEvent): void
  onUp?(e: GestureEvent): void
  onWheel?(e: WheelEvent): void
}

export default function useGesturePlugins(
  ref: React.RefObject<HTMLElement>,
  plugins: GesturePlugin[],
  options: { passive?: boolean } = {},
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const supportsPointer = 'PointerEvent' in window
    const passive = options.passive ?? false

    const norm = (ev: PointerEvent | TouchEvent | MouseEvent): GestureEvent => ({
      clientX:
        'clientX' in ev
          ? ev.clientX
          : 'touches' in ev
          ? ev.touches[0].clientX
          : 0,
      clientY:
        'clientY' in ev
          ? ev.clientY
          : 'touches' in ev
          ? ev.touches[0].clientY
          : 0,
      pointerType: ((ev as PointerEvent).pointerType || ('touches' in ev ? 'touch' : 'mouse')) as
        | 'mouse'
        | 'touch'
        | 'pen',
      pressure:
        'pressure' in ev
          ? (ev as PointerEvent).pressure
          : 'touches' in ev
          ? 0.5
          : 0,
      button: 'button' in ev ? (ev as MouseEvent).button : 0,
      shiftKey: 'shiftKey' in ev ? (ev as MouseEvent).shiftKey : false,
      altKey: 'altKey' in ev ? (ev as MouseEvent).altKey : false,
      ctrlKey: 'ctrlKey' in ev ? (ev as MouseEvent).ctrlKey : false,
      metaKey: 'metaKey' in ev ? (ev as MouseEvent).metaKey : false,
      originalEvent: ev,
    })

    const handleDown = (e: PointerEvent | TouchEvent | MouseEvent) => {
      const data = norm(e)
      plugins.forEach((p) => p.onDown?.(data))
    }
    const handleMove = (e: PointerEvent | TouchEvent | MouseEvent) => {
      const data = norm(e)
      plugins.forEach((p) => p.onMove?.(data))
    }
    const handleUp = (e: PointerEvent | TouchEvent | MouseEvent) => {
      const data = norm(e)
      plugins.forEach((p) => p.onUp?.(data))
    }
    const handleWheel = (e: WheelEvent) => {
      plugins.forEach((p) => p.onWheel?.(e))
    }

    if (supportsPointer) {
      el.addEventListener('pointerdown', handleDown, { passive })
      el.addEventListener('pointermove', handleMove, { passive })
      el.addEventListener('pointerup', handleUp, { passive })
      el.addEventListener('pointercancel', handleUp, { passive })
    } else {
      el.addEventListener('mousedown', handleDown, { passive })
      el.addEventListener('mousemove', handleMove, { passive })
      el.addEventListener('mouseup', handleUp, { passive })
      el.addEventListener('touchstart', handleDown, { passive })
      el.addEventListener('touchmove', handleMove, { passive })
      el.addEventListener('touchend', handleUp, { passive })
      el.addEventListener('touchcancel', handleUp, { passive })
    }
    el.addEventListener('wheel', handleWheel, { passive })

    return () => {
      if (supportsPointer) {
        el.removeEventListener('pointerdown', handleDown)
        el.removeEventListener('pointermove', handleMove)
        el.removeEventListener('pointerup', handleUp)
        el.removeEventListener('pointercancel', handleUp)
      } else {
        el.removeEventListener('mousedown', handleDown)
        el.removeEventListener('mousemove', handleMove)
        el.removeEventListener('mouseup', handleUp)
        el.removeEventListener('touchstart', handleDown)
        el.removeEventListener('touchmove', handleMove)
        el.removeEventListener('touchend', handleUp)
        el.removeEventListener('touchcancel', handleUp)
      }
      el.removeEventListener('wheel', handleWheel)
    }
  }, [ref, plugins, options.passive])
}
