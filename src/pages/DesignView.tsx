import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DesignTopBar from '../components/DesignTopBar'
import LayoutCanvas, { type Point, type ElementItem } from '../components/LayoutCanvas'
import LayoutTools from '../components/LayoutTools'
import LayoutStats from '../components/LayoutStats'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'
import useUndoable from '../hooks/useUndoable'

export default function DesignView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects, lang } = useApp()
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

  const toggleScale = () => setScale((s) => (s === 10 ? 1 : 10))

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undoPts()
        undoEls()
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redoPts()
        redoEls()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undoPts, redoPts, undoEls, redoEls])

  if (!project) return <p>Project not found</p>

  return (
    <div className="dashboard">
      <DesignTopBar
        showGrid={showGrid}
        toggleGrid={() => setShowGrid((g) => !g)}
        scale={scale}
        toggleScale={toggleScale}
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
            sessionStorage.setItem(`layout_${projectId}`, JSON.stringify(points))
            navigate(`/project/${projectId}/course`)
          }}
          onClear={() => {
            setPoints([])
            setElements([])
          }}
          canSave={closed}
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
          />
        </main>
        <LayoutStats points={points} scale={scale} elements={elements} />
      </div>
    </div>
  )
}
