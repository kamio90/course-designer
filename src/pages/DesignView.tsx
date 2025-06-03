import { useState } from 'react'
import { useParams } from 'react-router-dom'
import DesignTopBar from '../components/DesignTopBar'
import LayoutCanvas, { type Point } from '../components/LayoutCanvas'
import LayoutTools from '../components/LayoutTools'
import LayoutStats from '../components/LayoutStats'
import { useApp } from '../context/AppContext'

export default function DesignView() {
  const { projectId } = useParams()
  const { projects } = useApp()
  const project = projects.find((p) => p.id === projectId)
  const [points, setPoints] = useState<Point[]>([])
  const [showGrid, setShowGrid] = useState(true)
  const [scale, setScale] = useState(10)

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
      />
      <div className="body">
        <LayoutTools onSave={() => alert('saved')} canSave={closed} />
        <main>
          <h2>{project.title}</h2>
          <LayoutCanvas points={points} setPoints={setPoints} showGrid={showGrid} scale={scale} />
        </main>
        <LayoutStats points={points} scale={scale} />
      </div>
    </div>
  )
}
