import TopBar from '../components/TopBar'
import ProjectsSidebar from '../components/ProjectsSidebar'
import SearchSidebar from '../components/SearchSidebar'
import CreateProjectForm from '../components/CreateProjectForm'
import { useApp } from '../context/AppContext'
import { Box } from '@mui/material'
import { Navigate } from 'react-router-dom'

export default function DashboardView() {
  const { user } = useApp()
  if (!user) return <Navigate to="/" />
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopBar />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <ProjectsSidebar />
        <Box
          component="main"
          sx={{ flex: 1, p: 2, display: 'flex', justifyContent: 'center' }}
        >
          <CreateProjectForm />
        </Box>
        <SearchSidebar />
      </Box>
    </Box>
  )
}
