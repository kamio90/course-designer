import { useMemo } from 'react'
import type { Point } from './LayoutCanvas'

interface Props {
  points: Point[]
  scale: number
}

export default function LayoutStats({ points, scale }: Props) {
  const stats = useMemo(() => {
    let length = 0
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x
      const dy = points[i].y - points[i - 1].y
      length += Math.hypot(dx, dy)
    }
    const closed = points.length > 2 && points[0].x === points[points.length - 1].x && points[0].y === points[points.length - 1].y
    let area = 0
    if (closed) {
      for (let i = 0; i < points.length - 1; i++) {
        area += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y
      }
      area = Math.abs(area / 2)
    }
    return { length, closed, area }
  }, [points])

  return (
    <aside className="sidebar right" aria-label="layout stats">
      <h2>Stats</h2>
      <ul>
        <li>Total points: {points.length}</li>
        <li>Total length: {(stats.length / scale).toFixed(2)} m</li>
        <li>Area: {(stats.area / (scale * scale)).toFixed(2)} m²</li>
        <li>Closed shape: {stats.closed ? 'Yes' : 'No'}</li>
      </ul>
    </aside>
  )
}
