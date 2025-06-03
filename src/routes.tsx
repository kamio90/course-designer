import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginView from './pages/LoginView'
import RegisterView from './pages/RegisterView'
import DashboardView from './pages/DashboardView'
import DesignView from './pages/DesignView'

const router = createBrowserRouter([
  { path: '/', element: <LoginView /> },
  { path: '/register', element: <RegisterView /> },
  { path: '/dashboard', element: <DashboardView /> },
  { path: '/project/:projectId', element: <DesignView /> },
])

export default function Routes() {
  return <RouterProvider router={router} />
}
