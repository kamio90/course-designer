import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react'
import {
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Tooltip,
  Box,
} from '@mui/material'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'
import { matchShortcut } from '../utils/shortcuts'
import useMultiTouch from '../hooks/useMultiTouch'
import useGesturePlugins, { type GesturePlugin } from '../hooks/useGesturePlugins'

export interface ElementItem {
  id: string
  type: string
  x: number
  y: number
  rotation: number
  w: number
  h: number
}

export interface Point {
  id: string
  x: number
  y: number
  label?: string
  start?: boolean
  end?: boolean
  radius?: number
}

interface Props {
  points: Point[]
  setPoints: (p: Point[]) => void
  showGrid: boolean
  scale: number
  gridSpacing: number
  snap: boolean
  autoStraight: boolean
  elements: ElementItem[]
  setElements: (e: ElementItem[]) => void
  measureMode: boolean
  onMeasureToggle?: () => void
  onUndo?: () => void
  onRedo?: () => void
  activeTool?: string | null
  onToolUsed?: () => void
  gesturePlugins?: GesturePlugin[]
}

interface ContextTarget {
  type: 'canvas' | 'point' | 'line' | 'element'
  index: number
  canvasPos?: { x: number; y: number }
}

export interface LayoutCanvasHandle {
  center: () => void
  clientToCanvas: (x: number, y: number) => { x: number; y: number }
}

const LayoutCanvas = forwardRef<LayoutCanvasHandle, Props>(function LayoutCanvas(
  {
    points,
    setPoints,
    showGrid,
    scale,
  gridSpacing,
  snap,
  autoStraight,
  elements,
  setElements,
  measureMode,
  onMeasureToggle,
    onUndo,
    onRedo,
    activeTool,
    onToolUsed,
    gesturePlugins,
  }: Props,
  ref: ForwardedRef<LayoutCanvasHandle>,
) {
  const { lang, shortcuts, advancedGestures } = useApp()
  const t = translations[lang]
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragEl, setDragEl] = useState<string | null>(null)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null)
  const [context, setContext] = useState<ContextTarget | null>(null)
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)
  const [renameInfo, setRenameInfo] = useState<{ index: number; value: string } | null>(null)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [curves, setCurves] = useState<Record<number, boolean>>({})
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)
  const [hoverFirst, setHoverFirst] = useState(false)
  const [closed, setClosed] = useState(false)
  const [radiusIndex, setRadiusIndex] = useState<number | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [space, setSpace] = useState(false)
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null)
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null)
  const longPressTimer = useRef<number>()
  const longPressPos = useRef<{ x: number; y: number } | null>(null)
  const activeTouches = useRef(0)
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<
    | {
        dist: number
        zoom: number
        center: { x: number; y: number }
        offset: { x: number; y: number }
      }
    | null
  >(null)
  const actionPointer = useRef<number | null>(null)
  const panPointer = useRef<number | null>(null)
  const forceState = useRef(new Map<number, boolean>())
  const HARD_PRESS = 0.5

  const cancelLongPress = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current)
    longPressTimer.current = undefined
    longPressPos.current = null
  }

  const centerView = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!points.length) {
      setOffset({ x: 0, y: 0 })
      setZoom(1)
      return
    }
    const pts = closed ? points.slice(0, -1) : points
    const minX = Math.min(...pts.map((p) => p.x))
    const maxX = Math.max(...pts.map((p) => p.x))
    const minY = Math.min(...pts.map((p) => p.y))
    const maxY = Math.max(...pts.map((p) => p.y))
    const pad = 40
    const w = maxX - minX || 1
    const h = maxY - minY || 1
    const zoomVal = Math.min(
      canvas.width / (w + pad),
      canvas.height / (h + pad),
    )
    setZoom(Math.min(3, zoomVal))
    setOffset({
      x: canvas.width / 2 - ((minX + maxX) / 2) * zoomVal,
      y: canvas.height / 2 - ((minY + maxY) / 2) * zoomVal,
    })
  }

  useImperativeHandle(ref, () => ({
    center: centerView,
    clientToCanvas: (x: number, y: number) => {
      const rect = canvasRef.current!.getBoundingClientRect()
      const scaleX = canvasRef.current!.width / rect.width
      const scaleY = canvasRef.current!.height / rect.height
      let cx = (x - rect.left) * scaleX
      let cy = (y - rect.top) * scaleY
      cx = (cx - offset.x) / zoom
      cy = (cy - offset.y) / zoom
      return { x: cx, y: cy }
    },
  }))

  useMultiTouch(canvasRef, centerView, onUndo, onRedo, advancedGestures)
  useGesturePlugins(canvasRef, gesturePlugins || [], { passive: false })

  useEffect(() => {
    const keyHandler = (ev: KeyboardEvent) => {
      const k = ev.key.toLowerCase()
      if (matchShortcut(ev, shortcuts.center)) {
        ev.preventDefault()
        centerView()
      } else if (matchShortcut(ev, shortcuts.measure)) {
        ev.preventDefault()
        if (onMeasureToggle) onMeasureToggle()
        setMeasureStart(null)
        setMeasureEnd(null)
      } else if (k === 'escape') {
        setMeasureStart(null)
        setMeasureEnd(null)
      } else if (k === 'enter' && points.length >= 3 && !closed) {
        ev.preventDefault()
        setPoints([...points, { ...points[0] }])
        setClosed(true)
      } else if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k) &&
        selectedIdx !== null
      ) {
        ev.preventDefault()
        const delta = ev.shiftKey ? 10 : 1
        const dx = k === 'arrowright' ? delta : k === 'arrowleft' ? -delta : 0
        const dy = k === 'arrowdown' ? delta : k === 'arrowup' ? -delta : 0
        setPoints(
          points.map((p, i) =>
            i === selectedIdx || (isClosed() && selectedIdx === 0 && i === points.length - 1)
              ? { ...p, x: p.x + dx, y: p.y + dy }
              : p,
          ),
        )
      } else if (k === 'delete' || k === 'backspace') {
        if (selectedIdx !== null) {
          ev.preventDefault()
          removePoint(selectedIdx)
          setSelectedIdx(null)
        }
      } else if (k === 'tab') {
        if (!points.length) return
        ev.preventDefault()
        const dir = ev.shiftKey ? -1 : 1
        const next = selectedIdx === null ? 0 : (selectedIdx + dir + points.length) % points.length
        setSelectedIdx(next)
      } else if (ev.code === 'Space') {
        setSpace(true)
      }
    }
    const upHandler = (ev: KeyboardEvent) => {
      if (ev.code === 'Space') setSpace(false)
    }
    window.addEventListener('keydown', keyHandler)
    window.addEventListener('keyup', upHandler)
    return () => {
      window.removeEventListener('keydown', keyHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [points, closed, selectedIdx, shortcuts])

  const isClosed = () => closed

  const getPos = (e: { clientX: number; clientY: number; shiftKey: boolean }) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = canvasRef.current!.width / rect.width
    const scaleY = canvasRef.current!.height / rect.height
    let x = (e.clientX - rect.left) * scaleX
    let y = (e.clientY - rect.top) * scaleY
    x = (x - offset.x) / zoom
    y = (y - offset.y) / zoom
    const snapActive = snap || e.shiftKey
    if (snapActive) {
      x = Math.round(x / gridSpacing) * gridSpacing
      y = Math.round(y / gridSpacing) * gridSpacing
    }
    return { x, y }
  }

  const distanceToSegment = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => {
    const dx = x2 - x1
    const dy = y2 - y1
    const l2 = dx * dx + dy * dy
    if (l2 === 0) return Math.hypot(px - x1, py - y1)
    let t = ((px - x1) * dx + (py - y1) * dy) / l2
    t = Math.max(0, Math.min(1, t))
    const xx = x1 + t * dx
    const yy = y1 + t * dy
    return Math.hypot(px - xx, py - yy)
  }

  const forcePress = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e)
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i]
      if (Math.hypot(p.x - x, p.y - y) < 8) {
        const dup = { ...p, id: crypto.randomUUID() }
        const list = [...points]
        list.splice(i + 1, 0, dup)
        setPoints(list)
        setSelectedIdx(i + 1)
        return
      }
    }
    if (!isClosed()) {
      setPoints([...points, { id: crypto.randomUUID(), x, y, radius: 0 }])
      setSelectedIdx(points.length)
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    forceState.current.set(e.pointerId, e.pressure >= HARD_PRESS)
    if (e.pressure >= HARD_PRESS) {
      forcePress(e)
      return
    }
    if (e.pointerType === 'touch') {
      const now = performance.now()
      if (
        lastTap.current &&
        now - lastTap.current.time < 300 &&
        Math.hypot(lastTap.current.x - e.clientX, lastTap.current.y - e.clientY) < 20
      ) {
        handleDoubleTap(e)
        lastTap.current = null
      } else {
        lastTap.current = { time: now, x: e.clientX, y: e.clientY }
      }
      activeTouches.current += 1
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const actionActive =
        dragIndex !== null || dragEl !== null || radiusIndex !== null
      if (
        advancedGestures &&
        !actionActive &&
        !panStart &&
        pointers.current.size === 2
      ) {
        const [a, b] = Array.from(pointers.current.values())
        pinch.current = {
          dist: Math.hypot(b.x - a.x, b.y - a.y),
          zoom,
          center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
          offset,
        }
      } else if (!actionActive) {
        const pos = getPos(e)
        const cx = e.clientX
        const cy = e.clientY
        longPressPos.current = { x: cx, y: cy }
        longPressTimer.current = window.setTimeout(() => {
          openContext(pos, cx, cy)
        }, 600)
      } else if (!panStart) {
        setPanStart({ x: e.clientX, y: e.clientY })
        panPointer.current = e.pointerId
      }
    }
    if (measureMode && e.button === 0) {
      cancelLongPress()
      const { x, y } = getPos(e)
      if (!measureStart) {
        setMeasureStart({ x, y })
        setMeasureEnd(null)
      } else {
        setMeasureEnd({ x, y })
      }
      actionPointer.current = e.pointerId
      return
    }
    if (activeTool && e.pointerType === 'touch') {
      const { x, y } = getPos(e)
      setElements([
        ...elements,
        { id: crypto.randomUUID(), type: activeTool, x, y, rotation: 0, w: 30, h: 30 },
      ])
      onToolUsed?.()
      return
    }
    if (e.button === 1 || (e.button === 0 && space)) {
      e.currentTarget.setPointerCapture(e.pointerId)
      cancelLongPress()
      setPanStart({ x: e.clientX, y: e.clientY })
      panPointer.current = e.pointerId
      return
    }
    const { x, y } = getPos(e)
    setSelectedIdx(null)
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i]
      if (Math.hypot(p.x - x, p.y - y) < 8) {
        if (e.altKey) {
        cancelLongPress()
        setRadiusIndex(i)
        actionPointer.current = e.pointerId
        return
        }
        if (i === 0 && points.length >= 3 && !isClosed() && e.button === 0) {
          cancelLongPress()
          setPoints([...points, { ...points[0] }])
          setClosed(true)
          return
        }
        cancelLongPress()
        setDragIndex(i)
        setSelectedIdx(i)
        actionPointer.current = e.pointerId
        return
      }
    }
    for (const el of elements) {
      if (x >= el.x - 10 && x <= el.x + 10 && y >= el.y - 10 && y <= el.y + 10) {
        cancelLongPress()
        setDragEl(el.id)
        setSelectedIdx(null)
        actionPointer.current = e.pointerId
        return
      }
    }
    if (e.button === 2) return
    if (isClosed()) return
    let nx = x
    let ny = y
    if (autoStraight && points.length) {
      const last = points[points.length - 1]
      if (Math.abs(nx - last.x) < 10) nx = last.x
      if (Math.abs(ny - last.y) < 10) ny = last.y
    }
    if (e.shiftKey && points.length) {
      const last = points[points.length - 1]
      const dx = nx - last.x
      const dy = ny - last.y
      const len = Math.hypot(dx, dy)
      if (len > 0) {
        const step = Math.PI / 12
        const angle = Math.atan2(dy, dx)
        const snapA = Math.round(angle / step) * step
        nx = last.x + len * Math.cos(snapA)
        ny = last.y + len * Math.sin(snapA)
      }
    }
    setPoints([...points, { id: crypto.randomUUID(), x: nx, y: ny, radius: 0 }])
    setSelectedIdx(points.length)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e)
    if (e.pointerType === 'touch') e.preventDefault()
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }
    if (
      advancedGestures &&
      pinch.current &&
      pointers.current.size === 2 &&
      actionPointer.current === null &&
      panPointer.current === null
    ) {
      e.preventDefault()
      const [a, b] = Array.from(pointers.current.values())
      const dist = Math.hypot(b.x - a.x, b.y - a.y)
      const scaleFactor = dist / pinch.current.dist
      const cx = (a.x + b.x) / 2
      const cy = (a.y + b.y) / 2
      setZoom(() => Math.max(0.2, Math.min(3, pinch.current!.zoom * scaleFactor)))
      setOffset({
        x: pinch.current.offset.x + (cx - pinch.current.center.x),
        y: pinch.current.offset.y + (cy - pinch.current.center.y),
      })
      return
    }
    if (forceState.current.has(e.pointerId) && !forceState.current.get(e.pointerId) && e.pressure >= HARD_PRESS) {
      forceState.current.set(e.pointerId, true)
      forcePress(e)
      return
    }
    if (longPressPos.current) {
      const dx = e.clientX - longPressPos.current.x
      const dy = e.clientY - longPressPos.current.y
      if (Math.hypot(dx, dy) > 5) {
        if (longPressTimer.current) window.clearTimeout(longPressTimer.current)
        longPressTimer.current = undefined
        longPressPos.current = null
      }
    }
    if (measureMode && measureStart && !measureEnd) {
      setMeasureEnd({ x, y })
      return
    }
    if (panStart && e.pointerId === panPointer.current) {
      e.preventDefault()
      setOffset({ x: offset.x + (e.clientX - panStart.x), y: offset.y + (e.clientY - panStart.y) })
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }
    if (radiusIndex !== null && e.pointerId === actionPointer.current) {
      e.preventDefault()
      const base = points[radiusIndex]
      const r = Math.hypot(base.x - x, base.y - y)
      setPoints(
        points.map((p, i) => (i === radiusIndex ? { ...p, radius: r } : p)),
      )
      setDragPreview({ x, y })
    } else if (dragIndex !== null && e.pointerId === actionPointer.current) {
      e.preventDefault()
      let nx = x
      let ny = y
      if (e.shiftKey && points.length > 1) {
        const baseIndex = dragIndex === 0 ? 1 : dragIndex - 1
        const base = points[baseIndex]
        const dx = x - base.x
        const dy = y - base.y
        const len = Math.hypot(dx, dy)
        if (len > 0) {
          const step = Math.PI / 12
          const angle = Math.atan2(dy, dx)
          const snapA = Math.round(angle / step) * step
          nx = base.x + len * Math.cos(snapA)
          ny = base.y + len * Math.sin(snapA)
        }
      }
      setPoints(
        points.map((p, i) => {
          if (dragIndex === i) return { ...p, x: nx, y: ny }
          if (
            isClosed() &&
            ((dragIndex === 0 && i === points.length - 1) ||
              (dragIndex === points.length - 1 && i === 0))
          ) {
            return { ...p, x: nx, y: ny }
          }
          return p
        }),
      )
      setDragPreview({ x: nx, y: ny })
    } else if (dragEl && e.pointerId === actionPointer.current) {
      e.preventDefault()
      setElements(elements.map((el) => (el.id === dragEl ? { ...el, x, y } : el)))
      setDragPreview({ x, y })
    } else {
      setDragPreview(null)
    }

    if (!isClosed() && points.length > 2 && Math.hypot(points[0].x - x, points[0].y - y) < 8) {
      setHoverFirst(true)
    } else {
      setHoverFirst(false)
    }

    // tooltip detection
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i]
      if (Math.hypot(p.x - x, p.y - y) < 8) {
        const label = p.label ?? `#${i + 1}`
        setTooltip({ x: e.clientX, y: e.clientY - 10, text: `${label} • ${t.snap}` })
        return
      }
    }
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      if (distanceToSegment(x, y, p1.x, p1.y, p2.x, p2.y) < 5) {
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) / scale
        setTooltip({ x: e.clientX, y: e.clientY - 10, text: `${len.toFixed(2)}m` })
        return
      }
    }
    setTooltip(null)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (e.pointerType === 'touch') {
      activeTouches.current = Math.max(0, activeTouches.current - 1)
    }
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) {
      pinch.current = null
    }
    if (e.pointerId === actionPointer.current) {
      if (dragIndex !== null) setSelectedIdx(dragIndex)
      setDragIndex(null)
      setDragEl(null)
      setRadiusIndex(null)
      actionPointer.current = null
    }
    if (e.pointerId === panPointer.current) {
      setPanStart(null)
      panPointer.current = null
    }
    setDragPreview(null)
    setHoverFirst(false)
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current)
    longPressTimer.current = undefined
    longPressPos.current = null
    if (pointers.current.size === 0) {
      pinch.current = null
    }
    forceState.current.delete(e.pointerId)
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e)
    for (let i = points.length - 1; i >= 0; i--) {
      if (Math.hypot(points[i].x - x, points[i].y - y) < 8) {
        removePoint(i)
        break
      }
    }
  }

  const handleDoubleTap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e)
    for (let i = points.length - 1; i >= 0; i--) {
      if (Math.hypot(points[i].x - x, points[i].y - y) < 8) {
        removePoint(i)
        return
      }
    }
  }

  const openContext = (
    pos: { x: number; y: number },
    clientX: number,
    clientY: number,
  ) => {
    let type: ContextTarget['type'] = 'canvas'
    let idx = -1
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i]
      if (Math.hypot(p.x - pos.x, p.y - pos.y) < 8) {
        type = 'point'
        idx = i
        setSelectedIdx(i)
        break
      }
    }
    if (type === 'canvas') {
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]
        const p2 = points[i + 1]
        if (distanceToSegment(pos.x, pos.y, p1.x, p1.y, p2.x, p2.y) < 5) {
          type = 'line'
          idx = i
          break
        }
      }
    }
    if (type === 'canvas') {
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i]
        if (
          pos.x >= el.x - el.w / 2 &&
          pos.x <= el.x + el.w / 2 &&
          pos.y >= el.y - el.h / 2 &&
          pos.y <= el.y + el.h / 2
        ) {
          type = 'element'
          idx = i
          break
        }
      }
    }
    setContext({ type, index: idx, canvasPos: pos })
    setAnchor({ x: clientX, y: clientY })
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const pos = getPos(e)
    openContext(pos, e.clientX, e.clientY)
  }

  const createPoint = () => {
    if (isClosed()) {
      setContext(null)
      return
    }
    if (context?.canvasPos) {
      setPoints([
        ...points,
        { id: crypto.randomUUID(), x: context.canvasPos.x, y: context.canvasPos.y, radius: 0 },
      ])
    }
    setContext(null)
  }

  const removePoint = (idx: number) => {
    if (isClosed()) {
      if (idx === 0) {
        const trimmed = points.slice(1, points.length - 1)
        setPoints(trimmed)
        setClosed(false)
        setContext(null)
        return
      }
      if (idx === points.length - 1) {
        setPoints(points.slice(0, points.length - 1))
        setClosed(false)
        setContext(null)
        return
      }
    }
    setPoints(points.filter((_, i) => i !== idx))
    setSelectedIdx(null)
    setContext(null)
  }

  const renamePoint = (idx: number) => {
    const p = points[idx]
    setRenameInfo({ index: idx, value: p.label ?? '' })
    setContext(null)
  }

  const insertPointRelative = (idx: number, after: boolean) => {
    const base = points[idx]
    const offsetVal = 10
    const newPoint: Point = {
      id: crypto.randomUUID(),
      x: base.x + offsetVal,
      y: base.y + offsetVal,
    }
    const list = [...points]
    list.splice(after ? idx + 1 : idx, 0, newPoint)
    setPoints(list)
    setSelectedIdx(after ? idx + 1 : idx)
    setContext(null)
  }

  const toggleSnapPoint = (idx: number) => {
    const p = points[idx]
    const nx = Math.round(p.x / gridSpacing) * gridSpacing
    const ny = Math.round(p.y / gridSpacing) * gridSpacing
    setPoints(points.map((pt, i) => (i === idx ? { ...pt, x: nx, y: ny } : pt)))
    setContext(null)
  }

  const markPoint = (idx: number, field: 'start' | 'end') => {
    setPoints(
      points.map((p, i) => ({ ...p, [field]: i === idx })),
    )
    setContext(null)
  }

  const setCornerRadius = (idx: number) => {
    const p = points[idx]
    const input = prompt('Radius (m):', ((p.radius ?? 0) / scale).toFixed(2))
    if (!input) {
      setContext(null)
      return
    }
    const val = parseFloat(input)
    if (Number.isNaN(val) || val < 0) {
      setContext(null)
      return
    }
    setPoints(points.map((pt, i) => (i === idx ? { ...pt, radius: val * scale } : pt)))
    setContext(null)
  }

  const insertMidpoint = (idx: number) => {
    const p1 = points[idx]
    const p2 = points[idx + 1]
    const mid: Point = {
      id: crypto.randomUUID(),
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
      radius: 0,
    }
    const list = [...points]
    list.splice(idx + 1, 0, mid)
    setPoints(list)
    setContext(null)
  }

  const deleteLine = (idx: number) => {
    if (idx + 1 >= points.length) return
    if (isClosed() && idx === points.length - 2) {
      setPoints(points.slice(0, points.length - 1))
      setClosed(false)
    } else {
      setPoints(points.filter((_, i) => i !== idx + 1))
    }
    setContext(null)
  }

  const toggleCurveForLine = (idx: number) => {
    setCurves({ ...curves, [idx]: !curves[idx] })
    setContext(null)
  }

  const editLineLength = (idx: number) => {
    const p1 = points[idx]
    const p2 = points[idx + 1]
    const current = Math.hypot(p2.x - p1.x, p2.y - p1.y) / scale
    const input = prompt(t.editLength, current.toFixed(2))
    if (!input) {
      setContext(null)
      return
    }
    const val = parseFloat(input)
    if (Number.isNaN(val) || val <= 0) {
      setContext(null)
      return
    }
    const factor = (val * scale) / Math.hypot(p2.x - p1.x, p2.y - p1.y)
    const nx = p1.x + (p2.x - p1.x) * factor
    const ny = p1.y + (p2.y - p1.y) * factor
    const list = points.map((p, i) => {
      if (i === idx + 1) return { ...p, x: nx, y: ny }
      if (isClosed() && idx === points.length - 2 && i === 0) {
        return { ...p, x: nx, y: ny }
      }
      return p
    })
    setPoints(list)
    setContext(null)
  }

  const straightenEdge = (idx: number) => {
    const p1 = points[idx]
    const p2 = points[idx + 1]
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    let nx = p2.x
    let ny = p2.y
    if (Math.abs(dx) > Math.abs(dy)) {
      ny = p1.y
    } else {
      nx = p1.x
    }
    if (snap) {
      nx = Math.round(nx / gridSpacing) * gridSpacing
      ny = Math.round(ny / gridSpacing) * gridSpacing
    }
    const list = points.map((p, i) => {
      if (i === idx + 1) return { ...p, x: nx, y: ny }
      if (isClosed() && idx === points.length - 2 && i === 0) {
        return { ...p, x: nx, y: ny }
      }
      return p
    })
    setPoints(list)
    setContext(null)
  }

  const resizeElement = (idx: number) => {
    const el = elements[idx]
    const wInput = prompt('Width (m):', (el.w / scale).toFixed(2))
    if (!wInput) {
      setContext(null)
      return
    }
    const hInput = prompt('Height (m):', (el.h / scale).toFixed(2))
    if (!hInput) {
      setContext(null)
      return
    }
    const nw = parseFloat(wInput) * scale
    const nh = parseFloat(hInput) * scale
    if (Number.isNaN(nw) || Number.isNaN(nh) || nw <= 0 || nh <= 0) {
      setContext(null)
      return
    }
    setElements(
      elements.map((e, i) => (i === idx ? { ...e, w: nw, h: nh } : e)),
    )
    setContext(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    const type = e.dataTransfer.getData('text/plain')
    if (!type) return
    const { x, y } = getPos(e)
    setElements([
      ...elements,
      { id: crypto.randomUUID(), type, x, y, rotation: 0, w: 30, h: 30 },
    ])
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const forceHandler = (ev: MouseEvent & { webkitForce?: number; pointerId?: number }) => {
      if (ev.webkitForce !== undefined && ev.webkitForce >= 2) {
        const id = ev.pointerId ?? 0
        if (!forceState.current.get(id)) {
          forceState.current.set(id, true)
          forcePress(ev as unknown as React.PointerEvent<HTMLCanvasElement>)
        }
      }
    }
    canvas.addEventListener('webkitmouseforcechanged', forceHandler as EventListener)
    return () => {
      canvas.removeEventListener('webkitmouseforcechanged', forceHandler as EventListener)
    }
  }, [points])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const preventMove = (ev: TouchEvent) => {
      if (activeTouches.current > 0) ev.preventDefault()
    }
    const gesture = (ev: Event) => ev.preventDefault()
    canvas.addEventListener('touchmove', preventMove, { passive: false })
    canvas.addEventListener('gesturestart', gesture as EventListener, { passive: false })
    canvas.addEventListener('gesturechange', gesture as EventListener, { passive: false })
    canvas.addEventListener('gestureend', gesture as EventListener, { passive: false })

    let ts: (e: TouchEvent) => void
    let tm: (e: TouchEvent) => void
    let te: (e: TouchEvent) => void
    if (!('PointerEvent' in window)) {
      const toPtr = (touch: Touch) => ({
        pointerId: touch.identifier,
        pointerType: 'touch',
        clientX: touch.clientX,
        clientY: touch.clientY,
        buttons: 1,
        shiftKey: false,
        altKey: false,
        preventDefault: () => {},
        currentTarget: canvas,
      } as unknown as React.PointerEvent<HTMLCanvasElement>)
      ts = (e) => {
        handlePointerDown(toPtr(e.changedTouches[0]))
      }
      tm = (e) => {
        handlePointerMove(toPtr(e.changedTouches[0]))
      }
      te = (e) => {
        handlePointerUp(toPtr(e.changedTouches[0]))
      }
      canvas.addEventListener('touchstart', ts, { passive: false })
      canvas.addEventListener('touchmove', tm, { passive: false })
      canvas.addEventListener('touchend', te)
    }

    return () => {
      canvas.removeEventListener('touchmove', preventMove)
      canvas.removeEventListener('gesturestart', gesture as EventListener)
      canvas.removeEventListener('gesturechange', gesture as EventListener)
      canvas.removeEventListener('gestureend', gesture as EventListener)
      if (!('PointerEvent' in window)) {
        canvas.removeEventListener('touchstart', ts)
        canvas.removeEventListener('touchmove', tm)
        canvas.removeEventListener('touchend', te)
      }
    }
  }, [])

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== 2000 * dpr) {
        canvas.width = 2000 * dpr
        canvas.height = 1500 * dpr
        ctx.scale(dpr, dpr)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    const handle = requestAnimationFrame(() => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      const styles = getComputedStyle(document.body)
      const highlight = styles.getPropertyValue('--highlight') || '#1fa870'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(zoom, 0, 0, zoom, offset.x, offset.y)

    if (showGrid) {
      for (let i = 0; i <= canvas.width; i += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.strokeStyle = (i / gridSpacing) % 5 === 0 ? '#ccc' : '#eee'
        ctx.stroke()
      }
      for (let j = 0; j <= canvas.height; j += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, j)
        ctx.lineTo(canvas.width, j)
        ctx.strokeStyle = (j / gridSpacing) % 5 === 0 ? '#ccc' : '#eee'
        ctx.stroke()
      }
    }

    if (points.length > 1) {
      ctx.strokeStyle = 'blue'
      ctx.beginPath()
      const n = points.length
      for (let i = 0; i < n; i++) {
        const curr = points[i]
        const prev = points[(i - 1 + n) % n]
        const next = points[(i + 1) % n]
        const r = curr.radius ?? 0
        if (i === 0) {
          ctx.moveTo(curr.x, curr.y)
        } else if (r > 0) {
          const v1x = curr.x - prev.x
          const v1y = curr.y - prev.y
          const v2x = next.x - curr.x
          const v2y = next.y - curr.y
          const len1 = Math.sqrt(v1x * v1x + v1y * v1y)
          const len2 = Math.sqrt(v2x * v2x + v2y * v2y)
          const ux1 = v1x / len1
          const uy1 = v1y / len1
          const ux2 = v2x / len2
          const uy2 = v2y / len2
          const p1x = curr.x - ux1 * r
          const p1y = curr.y - uy1 * r
          const p2x = curr.x + ux2 * r
          const p2y = curr.y + uy2 * r
          ctx.lineTo(p1x, p1y)
          ctx.arcTo(curr.x, curr.y, p2x, p2y, r)
        } else {
          ctx.lineTo(curr.x, curr.y)
        }
      }
      if (isClosed()) ctx.closePath()
      ctx.stroke()
    }

    ctx.font = '12px sans-serif'
    points.forEach((p, i) => {
      ctx.beginPath()
      let radius = dragIndex === i ? 7 : 5
      if (!isClosed() && i === 0 && hoverFirst) radius = 7
      ctx.fillStyle =
        selectedIdx === i
          ? highlight
          : dragIndex === i || (!isClosed() && i === 0 && hoverFirst)
          ? 'orange'
          : 'red'
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fill()
      const label = p.label ?? String(i + 1)
      ctx.fillStyle = 'black'
      ctx.fillText(label, p.x + 6, p.y - 6)
      if (p.radius) {
        ctx.font = '10px sans-serif'
        ctx.fillText(`r=${(p.radius / scale).toFixed(2)}m`, p.x + 6, p.y + 12)
        ctx.font = '12px sans-serif'
      }
    })

    ctx.fillStyle = 'green'
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1]
      const p2 = points[i]
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) / scale
      ctx.fillText(len.toFixed(2) + 'm', (p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
    }

    elements.forEach((el, idx) => {
      ctx.save()
      ctx.translate(el.x, el.y)
      ctx.rotate((el.rotation * Math.PI) / 180)
      switch (el.type) {
        case 'water':
          ctx.fillStyle = '#64b5f6'
          ctx.beginPath()
          ctx.ellipse(0, 0, el.w / 2, el.h / 2, 0, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'grass':
          ctx.fillStyle = '#81c784'
          ctx.fillRect(-el.w / 2, -el.h / 2, el.w, el.h)
          break
        case 'entrance':
          ctx.fillStyle = '#ffb74d'
          ctx.beginPath()
          ctx.moveTo(-el.w / 2, -el.h / 2)
          ctx.lineTo(el.w / 2, 0)
          ctx.lineTo(-el.w / 2, el.h / 2)
          ctx.closePath()
          ctx.fill()
          break
        case 'exit':
          ctx.fillStyle = '#f06292'
          ctx.beginPath()
          ctx.moveTo(el.w / 2, -el.h / 2)
          ctx.lineTo(-el.w / 2, 0)
          ctx.lineTo(el.w / 2, el.h / 2)
          ctx.closePath()
          ctx.fill()
          break
        case 'gazebo':
          ctx.fillStyle = '#8d6e63'
          ctx.fillRect(-el.w / 2, -el.h / 2, el.w, el.h / 2)
          ctx.fillStyle = '#bcaaa4'
          ctx.beginPath()
          ctx.moveTo(-el.w / 2 - 2, -el.h / 2)
          ctx.lineTo(0, -el.h)
          ctx.lineTo(el.w / 2 + 2, -el.h / 2)
          ctx.closePath()
          ctx.fill()
          break
        default:
          ctx.fillStyle = 'orange'
          ctx.fillRect(-el.w / 2, -el.h / 2, el.w, el.h)
      }
      ctx.fillStyle = 'black'
      ctx.fillText(String(idx + 1), 12, 0)
      ctx.restore()
    })

    if (dragPreview) {
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = 'orange'
      ctx.beginPath()
      ctx.arc(dragPreview.x, dragPreview.y, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    if (measureStart && measureEnd) {
      ctx.strokeStyle = '#d32f2f'
      ctx.beginPath()
      ctx.moveTo(measureStart.x, measureStart.y)
      ctx.lineTo(measureEnd.x, measureEnd.y)
      ctx.stroke()
      const len = Math.hypot(measureEnd.x - measureStart.x, measureEnd.y - measureStart.y) / scale
      ctx.fillStyle = '#d32f2f'
      const mx = (measureStart.x + measureEnd.x) / 2
      const my = (measureStart.y + measureEnd.y) / 2
      ctx.fillText(len.toFixed(2) + 'm', mx + 4, my - 4)
    }
    })
    return () => {
      cancelAnimationFrame(handle)
      window.removeEventListener('resize', resize)
    }
  }, [points, showGrid, scale, gridSpacing, elements, offset, zoom, curves, dragIndex, dragPreview, measureStart, measureEnd, measureMode])

  useEffect(() => {
    const closedDetected =
      points.length > 3 &&
      points[0].x === points[points.length - 1].x &&
      points[0].y === points[points.length - 1].y
    if (closedDetected !== closed) {
      setClosed(closedDetected)
    }
  }, [points, closed])

  return (
    <Box sx={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={2000}
        height={1500}
        style={{
          border: '1px solid #ccc',
          width: '100%',
          height: 600,
          touchAction: 'none',
          overscrollBehavior: 'contain',
        }}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenuCapture={(e) => e.preventDefault()}
        onContextMenu={(e) => {
          e.preventDefault()
          handleContextMenu(e)
        }}
        onWheel={(e) => {
          e.preventDefault()
          if (e.ctrlKey || e.metaKey) {
            setZoom((z) => Math.max(0.2, Math.min(3, z - e.deltaY * 0.01)))
          } else {
            setOffset((o) => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }))
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onMouseLeave={() => setHoverFirst(false)}
        onDoubleClick={handleDoubleClick}
      />
      {measureMode && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#d32f2f', color: '#fff', px: 1, py: '2px', borderRadius: 1, fontSize: 12 }}>
          {measureEnd ? t.measureDone : t.measureMode}
        </Box>
      )}
      {tooltip && (
        <Tooltip open title={tooltip.text}>
          <Box sx={{ position: 'fixed', pointerEvents: 'none', top: tooltip.y, left: tooltip.x, width: 0, height: 0 }} />
        </Tooltip>
      )}
      <Menu
        open={!!context}
        onClose={() => setContext(null)}
        anchorReference="anchorPosition"
        anchorPosition={anchor ? { left: anchor.x, top: anchor.y } : undefined}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: 3, p: 0.5 } }}
      >
        {context?.type === 'canvas' && (
          <MenuItem onClick={createPoint}>{t.createPointHere}</MenuItem>
        )}
        {context?.type === 'point' && (
          <>
            <MenuItem onClick={() => renamePoint(context.index)}>{t.renamePoint}</MenuItem>
            <MenuItem onClick={() => removePoint(context.index)}>{t.delete}</MenuItem>
            <MenuItem onClick={() => markPoint(context.index, 'start')}>{t.markStart}</MenuItem>
            <MenuItem onClick={() => markPoint(context.index, 'end')}>{t.markEnd}</MenuItem>
            <Divider />
            <MenuItem onClick={() => insertPointRelative(context.index, false)}>{t.insertBefore}</MenuItem>
            <MenuItem onClick={() => insertPointRelative(context.index, true)}>{t.insertAfter}</MenuItem>
            <MenuItem onClick={() => toggleSnapPoint(context.index)}>{t.snap}</MenuItem>
            <MenuItem onClick={() => setCornerRadius(context.index)}>{t.roundCorner}</MenuItem>
          </>
        )}
        {context?.type === 'line' && (
          <>
            <MenuItem onClick={() => editLineLength(context.index)}>
              {t.editLength}
            </MenuItem>
            <MenuItem onClick={() => insertMidpoint(context.index)}>{t.insertMidpoint}</MenuItem>
            <MenuItem onClick={() => deleteLine(context.index)}>{t.deleteLine}</MenuItem>
            <MenuItem onClick={() => toggleCurveForLine(context.index)}>{t.toggleCurve}</MenuItem>
            <MenuItem onClick={() => straightenEdge(context.index)}>{t.straighten}</MenuItem>
          </>
        )}
        {context?.type === 'element' && (
          <MenuItem onClick={() => resizeElement(context.index)}>
            {t.resizeElement}
          </MenuItem>
        )}
      </Menu>
      <Dialog open={!!renameInfo} onClose={() => setRenameInfo(null)}>
        <DialogTitle>{t.renamePoint}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={renameInfo?.value ?? ''}
            onChange={(e) =>
              renameInfo && setRenameInfo({ index: renameInfo.index, value: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameInfo(null)}>Cancel</Button>
          <Button
            onClick={() => {
              if (renameInfo) {
                setPoints(points.map((p, i) => (i === renameInfo.index ? { ...p, label: renameInfo.value } : p)))
              }
              setRenameInfo(null)
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
})

export default LayoutCanvas
