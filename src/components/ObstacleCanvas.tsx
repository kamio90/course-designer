import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Point } from './LayoutCanvas'
import useGesturePlugins, { type GesturePlugin } from '../hooks/useGesturePlugins'

export interface Obstacle {
  id: string
  type: string
  x: number
  y: number
  rotation: number
  w: number
  h: number
}

export interface Connection {
  from: string
  to: string
}

interface Props {
  layout: Point[]
  obstacles: Obstacle[]
  setObstacles: (o: Obstacle[]) => void
  connections: Connection[]
  setConnections: (c: Connection[]) => void
  showGrid: boolean
  scale: number
  connectMode: boolean
  gesturePlugins?: GesturePlugin[]
}

export default function ObstacleCanvas({
  layout,
  obstacles,
  setObstacles,
  connections,
  setConnections,
  showGrid,
  scale,
  connectMode,
  gesturePlugins,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { advancedGestures } = useApp()
  const [dragId, setDragId] = useState<string | null>(null)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [connectSel, setConnectSel] = useState<string | null>(null)
  const [resize, setResize] = useState<{ id: string; dir: 'n' | 's' | 'e' | 'w' } | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const activeTouches = useRef(0)
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
  useGesturePlugins(canvasRef, gesturePlugins || [], { passive: false })

  const getPos = (e: { clientX: number; clientY: number; shiftKey: boolean }) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const scaleX = canvasRef.current!.width / rect.width
    const scaleY = canvasRef.current!.height / rect.height
    let x = (e.clientX - rect.left) * scaleX
    let y = (e.clientY - rect.top) * scaleY
    x = (x - offset.x) / zoom
    y = (y - offset.y) / zoom
    if (e.shiftKey) {
      x = Math.round(x / 50) * 50
      y = Math.round(y / 50) * 50
    }
    return { x, y }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'touch') {
      activeTouches.current += 1
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const actionActive = dragId || resize
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
      } else if (actionActive && !panStart) {
        setPanStart({ x: e.clientX, y: e.clientY })
        panPointer.current = e.pointerId
      }
    }
    if (e.button === 1) {
      e.currentTarget.setPointerCapture(e.pointerId)
      setPanStart({ x: e.clientX, y: e.clientY })
      panPointer.current = e.pointerId
      return
    }
    const { x, y } = getPos(e)
    for (const o of obstacles) {
      const handles = {
        e: { x: o.x + o.w / 2, y: o.y },
        w: { x: o.x - o.w / 2, y: o.y },
        n: { x: o.x, y: o.y - o.h / 2 },
        s: { x: o.x, y: o.y + o.h / 2 },
      }
      for (const dir of ['e', 'w', 'n', 's'] as const) {
        const h = handles[dir]
        if (Math.hypot(x - h.x, y - h.y) < 6) {
          e.currentTarget.setPointerCapture(e.pointerId)
          setResize({ id: o.id, dir })
          actionPointer.current = e.pointerId
          return
        }
      }
      if (x >= o.x - o.w / 2 && x <= o.x + o.w / 2 && y >= o.y - o.h / 2 && y <= o.y + o.h / 2) {
        if (connectMode) {
          if (connectSel) {
            setConnections([...connections, { from: connectSel, to: o.id }])
            setConnectSel(null)
          } else {
            setConnectSel(o.id)
          }
        } else {
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragId(o.id)
          actionPointer.current = e.pointerId
          }
        return
      }
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
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
    if (panStart && e.pointerId === panPointer.current) {
      e.preventDefault()
      setOffset({
        x: offset.x + (e.clientX - panStart.x),
        y: offset.y + (e.clientY - panStart.y),
      })
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }
    if (resize && e.pointerId === actionPointer.current) {
      e.preventDefault()
      const { x, y } = getPos(e)
      setObstacles(
        obstacles.map((o) => {
          if (o.id !== resize.id) return o
          switch (resize.dir) {
            case 'e':
              return { ...o, w: Math.max(20, (x - o.x) * 2) }
            case 'w':
              return { ...o, w: Math.max(20, (o.x - x) * 2) }
            case 'n':
              return { ...o, h: Math.max(20, (o.y - y) * 2) }
            case 's':
              return { ...o, h: Math.max(20, (y - o.y) * 2) }
            default:
              return o
          }
        }),
      )
    } else if (dragId && e.pointerId === actionPointer.current) {
      e.preventDefault()
      const { x, y } = getPos(e)
      setObstacles(obstacles.map((o) => (o.id === dragId ? { ...o, x, y } : o)))
    }
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
      setDragId(null)
      setResize(null)
      actionPointer.current = null
    }
    if (e.pointerId === panPointer.current) {
      setPanStart(null)
      panPointer.current = null
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    const type = e.dataTransfer.getData('text/plain')
    if (!type) return
    const { x, y } = getPos(e)
    setObstacles([
      ...obstacles,
      {
        id: crypto.randomUUID(),
        type,
        x,
        y,
        rotation: 0,
        w: 30,
        h: 30,
      },
    ])
  }

  const centerView = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!obstacles.length) {
      setOffset({ x: 0, y: 0 })
      setZoom(1)
      return
    }
    const minX = Math.min(...obstacles.map((o) => o.x))
    const maxX = Math.max(...obstacles.map((o) => o.x))
    const minY = Math.min(...obstacles.map((o) => o.y))
    const maxY = Math.max(...obstacles.map((o) => o.y))
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

  useEffect(() => {
    const keyHandler = (ev: KeyboardEvent) => {
      const k = ev.key.toLowerCase()
      if (k === 'r' && dragId) {
        setObstacles(
          obstacles.map((o) =>
            o.id === dragId ? { ...o, rotation: o.rotation + 15 } : o,
          ),
        )
      } else if (k === 'f') {
        ev.preventDefault()
        centerView()
      }
    }
    window.addEventListener('keydown', keyHandler)
    return () => window.removeEventListener('keydown', keyHandler)
  }, [dragId, obstacles])

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
      ts = (e) => handlePointerDown(toPtr(e.changedTouches[0]))
      tm = (e) => handlePointerMove(toPtr(e.changedTouches[0]))
      te = (e) => handlePointerUp(toPtr(e.changedTouches[0]))
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
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(zoom, 0, 0, zoom, offset.x, offset.y)

    if (showGrid) {
      ctx.strokeStyle = '#eee'
      for (let i = 0; i <= canvas.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let j = 0; j <= canvas.height; j += 50) {
        ctx.beginPath()
        ctx.moveTo(0, j)
        ctx.lineTo(canvas.width, j)
        ctx.stroke()
      }
    }

    if (layout.length > 1) {
      ctx.strokeStyle = 'blue'
      ctx.beginPath()
      ctx.moveTo(layout[0].x, layout[0].y)
      layout.slice(1).forEach((p) => ctx.lineTo(p.x, p.y))
      ctx.stroke()
    }

    obstacles.forEach((o, idx) => {
      ctx.save()
      ctx.translate(o.x, o.y)
      ctx.rotate((o.rotation * Math.PI) / 180)
      ctx.fillStyle = 'orange'
      ctx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h)
      ctx.fillStyle = 'black'
      ctx.fillText(String(idx + 1), -5, -o.h / 2 - 5)
      ctx.fillStyle = 'white'
      const handles = [
        { x: o.w / 2, y: 0 },
        { x: -o.w / 2, y: 0 },
        { x: 0, y: -o.h / 2 },
        { x: 0, y: o.h / 2 },
      ]
      handles.forEach((h) => {
        ctx.beginPath()
        ctx.rect(h.x - 3, h.y - 3, 6, 6)
        ctx.fill()
        ctx.strokeRect(h.x - 3, h.y - 3, 6, 6)
      })
      ctx.restore()
    })

    ctx.strokeStyle = 'red'
    connections.forEach((c) => {
      const a = obstacles.find((o) => o.id === c.from)
      const b = obstacles.find((o) => o.id === c.to)
      if (!a || !b) return
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
      const len = Math.hypot(a.x - b.x, a.y - b.y) / scale
      ctx.fillText(len.toFixed(2) + 'm', (a.x + b.x) / 2, (a.y + b.y) / 2)
    })
    })
    return () => {
      cancelAnimationFrame(handle)
      window.removeEventListener('resize', resize)
    }
  }, [layout, obstacles, connections, showGrid, offset, zoom, scale])

  return (
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
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onContextMenuCapture={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={(e) => {
        e.preventDefault()
        if (e.ctrlKey || e.metaKey) {
          setZoom((z) => Math.max(0.2, Math.min(3, z - e.deltaY * 0.01)))
        } else {
          setOffset((o) => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }))
        }
      }}
    />
  )
}
