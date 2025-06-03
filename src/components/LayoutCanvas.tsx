import { useRef, useState } from 'react'

interface Point { x: number; y: number }

interface Props {
  points: Point[]
  setPoints: (p: Point[]) => void
  showGrid: boolean
  scale: number
}

export default function LayoutCanvas({ points, setPoints, showGrid, scale }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target !== svgRef.current) return
    const rect = svgRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPoints([...points, { x, y }])
  }

  const handlePointerDown = (index: number) => {
    setDragIndex(index)
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragIndex === null) return
    const rect = svgRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPoints(points.map((p, i) => (i === dragIndex ? { x, y } : p)))
  }

  const handlePointerUp = () => setDragIndex(null)

  const gridLines = []
  if (showGrid) {
    for (let i = 0; i <= 800; i += 50) {
      gridLines.push(<line key={`v${i}`} x1={i} y1={0} x2={i} y2={600} stroke="#eee" />)
    }
    for (let j = 0; j <= 600; j += 50) {
      gridLines.push(<line key={`h${j}`} x1={0} y1={j} x2={800} y2={j} stroke="#eee" />)
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
    <svg
      ref={svgRef}
      viewBox="0 0 800 600"
      width="100%"
      height="600px"
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ border: '1px solid #ccc', touchAction: 'none', maxWidth: '100%' }}
    >
      {gridLines}
      {points.length > 1 && <polyline points={polyPoints} fill="none" stroke="blue" />}
      {points.map((p, i) => (
        <g key={i}>
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
    </svg>
  )
}

export type { Point }
