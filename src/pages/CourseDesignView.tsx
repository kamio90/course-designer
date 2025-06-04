import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CourseTopBar from '../components/CourseTopBar'
import ObstaclePalette from '../components/ObstaclePalette'
import CompetitionSidebar from '../components/CompetitionSidebar'
import type { Competition } from '../components/CompetitionSidebar'
import ObstacleCanvas from '../components/ObstacleCanvas'
import type { Obstacle, Connection } from '../components/ObstacleCanvas'
import type { Point } from '../components/LayoutCanvas'
import { useApp } from '../context/AppContext'

export default function CourseDesignView() {
  const { projectId } = useParams()
  const { projects } = useApp()
  const project = projects.find((p) => p.id === projectId)
  const [layout, setLayout] = useState<Point[]>([])
  const [showGrid, setShowGrid] = useState(true)
  const [scale, setScale] = useState(10)
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectMode, setConnectMode] = useState(false)

  const [competitions, setCompetitions] = useState<Competition[]>([
    { id: 'comp1', name: 'Competition 1' },
  ])
  const [active, setActive] = useState('comp1')
  useEffect(() => {
    const raw = sessionStorage.getItem(`layout_${projectId}`)
    if (raw) setLayout(JSON.parse(raw))
  }, [projectId])

  const toggleScale = () => setScale((s) => (s === 10 ? 5 : 10))

  const addCompetition = () => {
    const id = crypto.randomUUID()
    setCompetitions([...competitions, { id, name: `Competition ${competitions.length + 1}` }])
    setActive(id)
  }
  const rename = (id: string, name: string) => {
    setCompetitions(competitions.map((c) => (c.id === id ? { ...c, name } : c)))
  }
  const duplicate = () => {
    const current = competitions.find((c) => c.id === active)
    if (!current) return
    const id = crypto.randomUUID()
    setCompetitions([...competitions, { id, name: `${current.name} Copy` }])
    setActive(id)
  }

  if (!project) return <p>Project not found</p>

  return (
    <div className="dashboard">
      <CourseTopBar
        showGrid={showGrid}
        toggleGrid={() => setShowGrid((g) => !g)}
        scale={scale}
        toggleScale={toggleScale}
        connect={connectMode}
        toggleConnect={() => setConnectMode((c) => !c)}
      />
      <div className="body">
        <ObstaclePalette />
        <main>
          <h2>{project.title}</h2>
          <ObstacleCanvas
            layout={layout}
            obstacles={obstacles}
            setObstacles={setObstacles}
            connections={connections}
            setConnections={setConnections}
            showGrid={showGrid}
            scale={scale}
            connectMode={connectMode}
          />
        </main>
        <CompetitionSidebar
          competitions={competitions}
          active={active}
          setActive={setActive}
          add={addCompetition}
          rename={rename}
          duplicate={duplicate}
          exportCourse={() => alert('export')}
        />
      </div>
    </div>
  )
}
