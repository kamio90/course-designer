import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DesignTopBar from '../components/DesignTopBar'
import LayoutCanvas, { type Point, type ElementItem } from '../components/LayoutCanvas'
import LayoutTools from '../components/LayoutTools'
import LayoutStats from '../components/LayoutStats'
import { useApp } from '../context/AppContext'

export default function DesignView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects } = useApp()
  const project = projects.find((p) => p.id === projectId)
  const [points, setPoints] = useState<Point[]>([])
  const [elements, setElements] = useState<ElementItem[]>([])
  const [showGrid, setShowGrid] = useState(true)
  const [scale, setScale] = useState(10)
  const [snap, setSnap] = useState(false)
  const [autoStraight, setAutoStraight] = useState(false)

  if (!project) return <p>Project not found</p>

  const toggleScale = () => setScale((s) => (s === 10 ? 1 : 10))

  const closed =
    points.length > 2 && points[0].x === points[points.length - 1].x && points[0].y === points[points.length - 1].y

  return (
    <div className="dashboard">
      <DesignTopBar
        showGrid={showGrid}
        toggleGrid={() => setShowGrid((g) => !g)}
        scale={scale}
        toggleScale={toggleScale}
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
          canSave={closed}
        />
        <main>
          <h2>{project.title}</h2>
          <LayoutCanvas
            points={points}
            setPoints={setPoints}
            showGrid={showGrid}
            scale={scale}
            snap={snap}
            autoStraight={autoStraight}
            elements={elements}
            setElements={setElements}
          />
        </main>
        <LayoutStats points={points} scale={scale} />
      </div>
    </div>
  )
}
