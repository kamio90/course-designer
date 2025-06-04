import { AppProvider } from './context/AppContext'
import Routes from './routes'
import './App.css'

export default function App() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  )
}
