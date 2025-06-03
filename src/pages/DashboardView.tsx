import { useState } from 'react'
import TopBar from '../components/TopBar'
import ProjectsSidebar from '../components/ProjectsSidebar'
import SearchSidebar from '../components/SearchSidebar'
import CreateProjectForm from '../components/CreateProjectForm'
import { useApp } from '../context/AppContext'

export default function DashboardView() {
  const { user } = useApp()
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)
  if (!user) return <p>Please log in</p>
  return (
    <div className="dashboard">
      <TopBar />
      <div className="body">
        {showLeft && <ProjectsSidebar />}
        <main>
          <CreateProjectForm />
          <div className="toggle-buttons">
            <button onClick={() => setShowLeft((s) => !s)}>{showLeft ? '<' : '>'}</button>
            <button onClick={() => setShowRight((s) => !s)}>{showRight ? '>' : '<'}</button>
          </div>
        </main>
        {showRight && <SearchSidebar />}
      </div>
    </div>
  )
}
