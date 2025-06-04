export interface Vec2 { x: number; y: number }

function orientation(a: Vec2, b: Vec2, c: Vec2) {
  const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)
  if (val === 0) return 0
  return val > 0 ? 1 : 2
}

function onSegment(a: Vec2, b: Vec2, c: Vec2) {
  return (
    Math.min(a.x, c.x) <= b.x &&
    b.x <= Math.max(a.x, c.x) &&
    Math.min(a.y, c.y) <= b.y &&
    b.y <= Math.max(a.y, c.y)
  )
}

export function segmentsIntersect(p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2) {
  const o1 = orientation(p1, p2, q1)
  const o2 = orientation(p1, p2, q2)
  const o3 = orientation(q1, q2, p1)
  const o4 = orientation(q1, q2, p2)

  if (o1 !== o2 && o3 !== o4) return true
  if (o1 === 0 && onSegment(p1, q1, p2)) return true
  if (o2 === 0 && onSegment(p1, q2, p2)) return true
  if (o3 === 0 && onSegment(q1, p1, q2)) return true
  if (o4 === 0 && onSegment(q1, p2, q2)) return true
  return false
}

export function selfIntersects(poly: Vec2[]): boolean {
  const n = poly.length
  if (n < 4) return false
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      if (Math.abs(i - j) <= 1) continue
      if (i === 0 && j === n - 2) continue
      if (segmentsIntersect(poly[i], poly[i + 1], poly[j], poly[j + 1])) {
        return true
      }
    }
  }
  return false
}
