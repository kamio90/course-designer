import { useEffect, useRef, useState } from 'react'
import type { Point } from './LayoutCanvas'

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
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [connectSel, setConnectSel] = useState<string | null>(null)
  const [resize, setResize] = useState<{ id: string; dir: 'n' | 's' | 'e' | 'w' } | null>(null)

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
    if (e.pointerType === 'touch') e.preventDefault()
    if (e.button === 1) {
      setPanStart({ x: e.clientX, y: e.clientY })
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
          setResize({ id: o.id, dir })
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
          setDragId(o.id)
        }
        return
      }
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (panStart) {
      setOffset({
        x: offset.x + (e.clientX - panStart.x),
        y: offset.y + (e.clientY - panStart.y),
      })
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }
    if (resize) {
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
    } else if (dragId) {
      const { x, y } = getPos(e)
      setObstacles(obstacles.map((o) => (o.id === dragId ? { ...o, x, y } : o)))
    }
  }

  const handlePointerUp = () => {
    setDragId(null)
    setPanStart(null)
    setResize(null)
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
  }, [layout, obstacles, connections, showGrid, offset, zoom, scale])

  return (
    <canvas
      ref={canvasRef}
      width={2000}
      height={1500}
      style={{ border: '1px solid #ccc', width: '100%', height: 600, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onContextMenuCapture={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={(e) => setZoom((z) => Math.max(0.2, Math.min(3, z - e.deltaY * 0.001)))}
    />
  )
}
