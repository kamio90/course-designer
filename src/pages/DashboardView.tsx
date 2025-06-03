import TopBar from '../components/TopBar'
import ProjectsSidebar from '../components/ProjectsSidebar'
import SearchSidebar from '../components/SearchSidebar'
import CreateProjectForm from '../components/CreateProjectForm'
import { useApp } from '../context/AppContext'

export default function DashboardView() {
  const { user } = useApp()
  if (!user) return <p>Please log in</p>
  return (
    <div className="dashboard">
      <TopBar />
      <div className="body">
        <ProjectsSidebar />
        <main>
          <CreateProjectForm />
        </main>
        <SearchSidebar />
      </div>
    </div>
  )
}
