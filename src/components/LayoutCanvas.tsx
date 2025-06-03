import { useRef, useState } from 'react'

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
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target !== svgRef.current) return
    const rect = svgRef.current!.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    if (snap) {
      x = Math.round(x / 50) * 50
      y = Math.round(y / 50) * 50
    }
    if (autoStraight && points.length) {
      const last = points[points.length - 1]
      if (Math.abs(x - last.x) < 10) x = last.x
      if (Math.abs(y - last.y) < 10) y = last.y
    }
    setPoints([...points, { x, y }])
  }

  const handlePointerDown = (index: number) => {
    setDragIndex(index)
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragIndex === null) return
    const rect = svgRef.current!.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    if (snap) {
      x = Math.round(x / 50) * 50
      y = Math.round(y / 50) * 50
    }
    setPoints(points.map((p, i) => (i === dragIndex ? { x, y } : p)))
  }

  const handleElementPointerDown = (id: string) => {
    setDragEl(id)
  }

  const handleElementMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragEl) return
    const rect = svgRef.current!.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    if (snap) {
      x = Math.round(x / 50) * 50
      y = Math.round(y / 50) * 50
    }
    setElements(elements.map((el) => (el.id === dragEl ? { ...el, x, y } : el)))
  }

  const handleDrop = (e: React.DragEvent<SVGSVGElement>) => {
    const type = e.dataTransfer.getData('text/plain')
    if (!type) return
    const rect = svgRef.current!.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    if (snap) {
      x = Math.round(x / 50) * 50
      y = Math.round(y / 50) * 50
    }
    setElements([
      ...elements,
      { id: crypto.randomUUID(), type, x, y, rotation: 0 },
    ])
  }

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, index })
  }

  const removePoint = (index: number) => {
    setPoints(points.filter((_, i) => i !== index))
    setMenu(null)
  }

  const [dragEl, setDragEl] = useState<string | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number; index: number } | null>(null)

  const handlePointerUp = () => {
    setDragIndex(null)
    setDragEl(null)
  }

  const gridLines = []
  if (showGrid) {
    for (let i = 0; i <= 2000; i += 50) {
      gridLines.push(
        <line key={`v${i}`} x1={i} y1={0} x2={i} y2={1500} stroke="#eee" />,
      )
    }
    for (let j = 0; j <= 1500; j += 50) {
      gridLines.push(
        <line key={`h${j}`} x1={0} y1={j} x2={2000} y2={j} stroke="#eee" />,
      )
    }
  }

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const segments = [] as { x: number; y: number; len: number }[]
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1]
    const p2 = points[i]
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) / scale
    segments.push({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, len })
  }

  return (
    <>
    <svg
      ref={svgRef}
      viewBox="0 0 2000 1500"
      width="100%"
      height="600px"
      onClick={handleClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onPointerMove={(e) => {
        handlePointerMove(e)
        handleElementMove(e)
      }}
      onPointerUp={handlePointerUp}
      style={{ border: '1px solid #ccc', touchAction: 'none', maxWidth: '100%' }}
    >
      {gridLines}
      {points.length > 1 && <polyline points={polyPoints} fill="none" stroke="blue" />}
      {points.map((p, i) => (
        <g key={i} onContextMenu={(e) => handleContextMenu(e, i)}>
          <circle
            cx={p.x}
            cy={p.y}
            r={5}
            fill="red"
            onPointerDown={() => handlePointerDown(i)}
          />
          <text x={p.x + 6} y={p.y - 6} fontSize={12} pointerEvents="none">
            {i + 1}
          </text>
        </g>
      ))}
      {segments.map((s, i) => (
        <text key={`len${i}`} x={s.x} y={s.y} fontSize={12} fill="green" pointerEvents="none">
          {s.len.toFixed(2)}m
        </text>
      ))}
      {elements.map((el, i) => (
        <g
          key={el.id}
          transform={`translate(${el.x} ${el.y}) rotate(${el.rotation})`}
        >
          <rect
            x={-10}
            y={-10}
            width={20}
            height={20}
            fill="orange"
            onPointerDown={() => handleElementPointerDown(el.id)}
          />
          <text x={12} y={0} fontSize={12} pointerEvents="none">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
    {menu && (
      <ul
        className="context-menu"
        style={{ top: menu.y, left: menu.x }}
      >
        <li>
          <button onClick={() => removePoint(menu.index)}>Delete</button>
        </li>
      </ul>
    )}
    </>
  )
}

export type { Point, ElementItem }
