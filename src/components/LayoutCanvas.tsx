import { useEffect, useRef, useState } from 'react'
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

export interface ElementItem {
  id: string
  type: string
  x: number
  y: number
  rotation: number
}

export interface Point {
  id: string
  x: number
  y: number
  label?: string
  start?: boolean
  end?: boolean
}

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

interface ContextTarget {
  type: 'canvas' | 'point' | 'line'
  index: number
  canvasPos?: { x: number; y: number }
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
  const { lang } = useApp()
  const t = translations[lang]
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragEl, setDragEl] = useState<string | null>(null)
  const [context, setContext] = useState<ContextTarget | null>(null)
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)
  const [renameInfo, setRenameInfo] = useState<{ index: number; value: string } | null>(null)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [curves, setCurves] = useState<Record<number, boolean>>({})
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  const getPos = (e: { clientX: number; clientY: number; shiftKey: boolean }) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    let x = (e.clientX - rect.left - offset.x) / zoom
    let y = (e.clientY - rect.top - offset.y) / zoom
    const snapActive = snap || e.shiftKey
    if (snapActive) {
      x = Math.round(x / 50) * 50
      y = Math.round(y / 50) * 50
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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 1) {
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }
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
    setPoints([...points, { id: crypto.randomUUID(), x: nx, y: ny }])
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e)
    if (panStart) {
      setOffset({ x: offset.x + (e.clientX - panStart.x), y: offset.y + (e.clientY - panStart.y) })
      setPanStart({ x: e.clientX, y: e.clientY })
      return
    }
    if (dragIndex !== null) {
      setPoints(points.map((p, i) => (i === dragIndex ? { ...p, x, y } : p)))
    } else if (dragEl) {
      setElements(elements.map((el) => (el.id === dragEl ? { ...el, x, y } : el)))
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

  const handlePointerUp = () => {
    setDragIndex(null)
    setDragEl(null)
    setPanStart(null)
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const pos = getPos(e)
    let type: ContextTarget['type'] = 'canvas'
    let idx = -1
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i]
      if (Math.hypot(p.x - pos.x, p.y - pos.y) < 8) {
        type = 'point'
        idx = i
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
    setContext({ type, index: idx, canvasPos: pos })
    setAnchor({ x: e.clientX, y: e.clientY })
  }

  const createPoint = () => {
    if (context?.canvasPos) {
      setPoints([...points, { id: crypto.randomUUID(), x: context.canvasPos.x, y: context.canvasPos.y }])
    }
    setContext(null)
  }

  const removePoint = (idx: number) => {
    setPoints(points.filter((_, i) => i !== idx))
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
    setContext(null)
  }

  const toggleSnapPoint = (idx: number) => {
    const p = points[idx]
    const nx = Math.round(p.x / 50) * 50
    const ny = Math.round(p.y / 50) * 50
    setPoints(points.map((pt, i) => (i === idx ? { ...pt, x: nx, y: ny } : pt)))
    setContext(null)
  }

  const markPoint = (idx: number, field: 'start' | 'end') => {
    setPoints(
      points.map((p, i) => ({ ...p, [field]: i === idx })),
    )
    setContext(null)
  }

  const insertMidpoint = (idx: number) => {
    const p1 = points[idx]
    const p2 = points[idx + 1]
    const mid: Point = {
      id: crypto.randomUUID(),
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    }
    const list = [...points]
    list.splice(idx + 1, 0, mid)
    setPoints(list)
    setContext(null)
  }

  const deleteLine = (idx: number) => {
    if (idx + 1 >= points.length) return
    setPoints(points.filter((_, i) => i !== idx + 1))
    setContext(null)
  }

  const toggleCurveForLine = (idx: number) => {
    setCurves({ ...curves, [idx]: !curves[idx] })
    setContext(null)
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

    if (points.length > 1) {
      ctx.strokeStyle = 'blue'
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        const p = points[i]
        const prev = points[i - 1]
        if (curves[i - 1]) {
          const mx = (prev.x + p.x) / 2
          const my = (prev.y + p.y) / 2 - 40
          ctx.quadraticCurveTo(mx, my, p.x, p.y)
        } else {
          ctx.lineTo(p.x, p.y)
        }
      }
      ctx.stroke()
    }

    ctx.fillStyle = 'red'
    ctx.font = '12px sans-serif'
    points.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
      ctx.fill()
      const label = p.label ?? String(i + 1)
      ctx.fillText(label, p.x + 6, p.y - 6)
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
  }, [points, showGrid, scale, elements, offset, zoom, curves])

  return (
    <Box sx={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={2000}
        height={1500}
        style={{ border: '1px solid #ccc', width: '100%', height: 600, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
        onWheel={(e) => setZoom((z) => Math.max(0.2, Math.min(3, z - e.deltaY * 0.001)))}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      />
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
          </>
        )}
        {context?.type === 'line' && (
          <>
            <MenuItem onClick={() => insertMidpoint(context.index)}>{t.insertMidpoint}</MenuItem>
            <MenuItem onClick={() => deleteLine(context.index)}>{t.deleteLine}</MenuItem>
            <MenuItem onClick={() => toggleCurveForLine(context.index)}>{t.toggleCurve}</MenuItem>
          </>
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
}
