import { useRef, useState, useEffect } from 'react'

interface ElementItem {
  id: string
  type: string
  x: number
  y: number
  rotation: number
}

interface Point { x: number; y: number }

interface Props {
  points: Point[]
  setPoints: (p: Point[]) => void
  showGrid: boolean
  scale: number
  snap: boolean
  autoStraight: boolean
  elements: ElementItem[]
  setElements: (e: ElementItem[]) => void
}

export default function LayoutCanvas({
  points,
  setPoints,
  showGrid,
  scale,
  snap,
  autoStraight,
  elements,
  setElements,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragEl, setDragEl] = useState<string | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number; index: number } | null>(null)

  const getPos = (e: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    if (snap) {
      x = Math.round(x / 50) * 50
      y = Math.round(y / 50) * 50
    }
    return { x, y }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e)
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i]
      if (Math.hypot(p.x - x, p.y - y) < 8) {
        setDragIndex(i)
        return
      }
    }
    for (const el of elements) {
      if (x >= el.x - 10 && x <= el.x + 10 && y >= el.y - 10 && y <= el.y + 10) {
        setDragEl(el.id)
        return
      }
    }
    if (e.button === 2) return
    let nx = x
    let ny = y
    if (autoStraight && points.length) {
      const last = points[points.length - 1]
      if (Math.abs(nx - last.x) < 10) nx = last.x
      if (Math.abs(ny - last.y) < 10) ny = last.y
    }
    setPoints([...points, { x: nx, y: ny }])
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragIndex !== null) {
      const { x, y } = getPos(e)
      setPoints(points.map((p, i) => (i === dragIndex ? { x, y } : p)))
    } else if (dragEl) {
      const { x, y } = getPos(e)
      setElements(elements.map((el) => (el.id === dragEl ? { ...el, x, y } : el)))
    }
  }

  const handlePointerUp = () => {
    setDragIndex(null)
    setDragEl(null)
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const { x, y } = getPos(e)
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i]
      if (Math.hypot(p.x - x, p.y - y) < 8) {
        setMenu({ x: e.clientX, y: e.clientY, index: i })
        return
      }
    }
    setMenu(null)
  }

  const removePoint = (idx: number) => {
    setPoints(points.filter((_, i) => i !== idx))
    setMenu(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    const type = e.dataTransfer.getData('text/plain')
    if (!type) return
    const { x, y } = getPos(e)
    setElements([...elements, { id: crypto.randomUUID(), type, x, y, rotation: 0 }])
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

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

    if (points.length > 1) {
      ctx.strokeStyle = 'blue'
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y))
      ctx.stroke()
    }

    ctx.fillStyle = 'red'
    ctx.font = '12px sans-serif'
    points.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillText(String(i + 1), p.x + 6, p.y - 6)
    })

    ctx.fillStyle = 'green'
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1]
      const p2 = points[i]
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) / scale
      ctx.fillText(len.toFixed(2) + 'm', (p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
    }

    ctx.fillStyle = 'orange'
    elements.forEach((el, idx) => {
      ctx.save()
      ctx.translate(el.x, el.y)
      ctx.rotate((el.rotation * Math.PI) / 180)
      ctx.fillRect(-10, -10, 20, 20)
      ctx.fillStyle = 'black'
      ctx.fillText(String(idx + 1), 12, 0)
      ctx.restore()
    })
  }, [points, showGrid, scale, elements])

  return (
    <>
      <canvas
        ref={canvasRef}
        width={2000}
        height={1500}
        style={{ border: '1px solid #ccc', width: '100%', height: 600, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      />
      {menu && (
        <ul className="context-menu" style={{ top: menu.y, left: menu.x }}>
          <li>
            <button onClick={() => removePoint(menu.index)}>Delete</button>
          </li>
        </ul>
      )}
    </>
  )
}

export type { Point, ElementItem }
