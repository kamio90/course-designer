import { useEffect } from 'react'

export default function useMultiTouch(
  ref: React.RefObject<HTMLElement>,
  center: () => void,
  undo?: () => void,
  redo?: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    const points = new Map<number, { x: number; y: number }>()
    let twoTimer: number | null = null
    let threeStart: { x: number; y: number }[] | null = null
    let threeDone = false

    function down(e: PointerEvent) {
      if (e.pointerType !== 'touch') return
      e.preventDefault()
      points.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (points.size === 2) {
        twoTimer = window.setTimeout(() => {
          twoTimer = null
        }, 250)
      } else if (points.size === 3) {
        threeStart = Array.from(points.values())
        threeDone = false
      }
    }

    function move(e: PointerEvent) {
      if (!points.has(e.pointerId)) return
      if (points.size > 1) e.preventDefault()
      points.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (threeStart && points.size === 3 && !threeDone) {
        const now = Array.from(points.values())
        const dx =
          now.reduce((s, p, i) => s + (p.x - threeStart![i].x), 0) / 3
        const dy =
          now.reduce((s, p, i) => s + (p.y - threeStart![i].y), 0) / 3
        if (Math.abs(dx) > 40 && Math.abs(dy) < 30) {
          if (dx > 0) {
            redo?.()
          } else {
            undo?.()
          }
          threeDone = true
        }
      }
    }

    function up(e: PointerEvent) {
      if (!points.has(e.pointerId)) return
      points.delete(e.pointerId)
      if (points.size === 0) {
        if (twoTimer) {
          center()
          window.clearTimeout(twoTimer)
          twoTimer = null
        }
        threeStart = null
      }
    }

    const opts = { passive: false } as AddEventListenerOptions
    el.addEventListener('pointerdown', down, opts)
    el.addEventListener('pointermove', move, opts)
    el.addEventListener('pointerup', up, opts)
    el.addEventListener('pointercancel', up, opts)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [ref, center, undo, redo, enabled])
}
