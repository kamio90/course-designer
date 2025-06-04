import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DesignTopBar from '../components/DesignTopBar'
import LayoutCanvas, { type Point, type ElementItem } from '../components/LayoutCanvas'
import LayoutTools from '../components/LayoutTools'
import LayoutStats from '../components/LayoutStats'
import HistoryPanel from '../components/HistoryPanel'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'
import useUndoable from '../hooks/useUndoable'
import { selfIntersects } from '../utils/geometry'
import { matchShortcut } from '../utils/shortcuts'

export default function DesignView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects, lang, shortcuts } = useApp()
  const t = translations[lang]
  const project = projects.find((p) => p.id === projectId)
  const pointsHistory = useUndoable<Point[]>([])
  const elementsHistory = useUndoable<ElementItem[]>([])
  const {
    state: points,
    set: setPoints,
    replace: replacePoints,
    undo: undoPts,
    redo: redoPts,
  } = pointsHistory
  const {
    state: elements,
    set: setElements,
    replace: replaceElements,
    undo: undoEls,
    redo: redoEls,
  } = elementsHistory
  const [showGrid, setShowGrid] = useState(true)
  const [scale, setScale] = useState(10)
  const [gridSpacing, setGridSpacing] = useState(50)
  const [snap, setSnap] = useState(false)
  const [autoStraight, setAutoStraight] = useState(false)
  const [measureMode, setMeasureMode] = useState(false)


  // restore autosaved layout on mount
  useEffect(() => {
    if (!projectId) return
    const saved = localStorage.getItem(`autosave_${projectId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.points) replacePoints(parsed.points as Point[])
        if (parsed.elements) replaceElements(parsed.elements as ElementItem[])
        alert(t.autosaveRestored)
      } catch {
        /* ignore */
      }
    }
  }, [projectId])

  // autosave on change
  useEffect(() => {
    if (!projectId) return
    localStorage.setItem(
      `autosave_${projectId}`,
      JSON.stringify({ points, elements }),
    )
  }, [projectId, points, elements])

  const closed =
    points.length > 3 &&
    points[0].x === points[points.length - 1].x &&
    points[0].y === points[points.length - 1].y
  const validPolygon =
    closed &&
    points.length > 3 &&
    !selfIntersects(points.slice(0, -1))

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (matchShortcut(e, shortcuts.undo)) {
        e.preventDefault()
        undoPts()
        undoEls()
      } else if (matchShortcut(e, shortcuts.redo)) {
        e.preventDefault()
        redoPts()
        redoEls()
      } else if (matchShortcut(e, shortcuts.measure)) {
        setMeasureMode((m) => !m)
      } else if (matchShortcut(e, shortcuts.clear)) {
        e.preventDefault()
        setPoints([])
        setElements([])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undoPts, redoPts, undoEls, redoEls, shortcuts, setPoints, setElements])

  if (!project) return <p>Project not found</p>

  return (
    <div className="dashboard">
      <DesignTopBar
        showGrid={showGrid}
        toggleGrid={() => setShowGrid((g) => !g)}
        scale={scale}
        setScale={setScale}
        gridSpacing={gridSpacing}
        setGridSpacing={setGridSpacing}
        snap={snap}
        toggleSnap={() => setSnap((s) => !s)}
        autoStraight={autoStraight}
        toggleAuto={() => setAutoStraight((a) => !a)}
      />
      <div className="body">
        <LayoutTools
          onSave={() => {
            if (!validPolygon) {
              alert(t.invalidShape)
              return
            }
            sessionStorage.setItem(`layout_${projectId}`, JSON.stringify(points))
            navigate(`/project/${projectId}/course`)
          }}
          onClear={() => {
            setPoints([])
            setElements([])
          }}
          onImport={(file) => {
            const reader = new FileReader()
            reader.onload = () => {
              try {
                const data = JSON.parse(reader.result as string)
                if (data.points) replacePoints(data.points)
                if (data.elements) replaceElements(data.elements)
              } catch {
                alert('Invalid file')
              }
            }
            reader.readAsText(file)
          }}
          onExport={() => {
            const blob = new Blob([
              JSON.stringify({ points, elements }, null, 2),
            ])
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'layout.json'
            a.click()
          }}
          onExportData={() => {
            const data = {
              points,
              elements,
              scale,
              gridSpacing,
            }
            const blob = new Blob([JSON.stringify(data, null, 2)])
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'course_data.json'
            a.click()
          }}
          onExportPNG={() => {
            const canvas = document.querySelector('canvas') as HTMLCanvasElement
            if (canvas) {
              const a = document.createElement('a')
              a.href = canvas.toDataURL('image/png')
              a.download = 'layout.png'
              a.click()
            }
          }}
          onToggleMeasure={() => setMeasureMode((m) => !m)}
          measureMode={measureMode}
          canSave={validPolygon}
        />
        <main>
          <h2>{project.title}</h2>
          <LayoutCanvas
            points={points}
            setPoints={setPoints}
            showGrid={showGrid}
            scale={scale}
            gridSpacing={gridSpacing}
            snap={snap}
            autoStraight={autoStraight}
            elements={elements}
            setElements={setElements}
            measureMode={measureMode}
            onMeasureToggle={() => setMeasureMode((m) => !m)}
          />
        </main>
        <LayoutStats points={points} scale={scale} elements={elements} />
        <HistoryPanel history={pointsHistory.history()} jump={pointsHistory.go} />
      </div>
    </div>
  )
}
