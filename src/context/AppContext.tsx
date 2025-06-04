import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, Project } from '../api/fakeApi'

interface AppContextProps {
  user: User | null
  login: (user: User) => void
  logout: () => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  lang: 'en' | 'pl'
  switchLang: (lang: 'en' | 'pl') => void
  projects: Project[]
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'courses'>) => void
  deleteProject: (id: string) => void
}

const AppContext = createContext<AppContextProps | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as User) : null
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  )
  const [lang, setLang] = useState<'en' | 'pl'>(
    () => (localStorage.getItem('lang') as 'en' | 'pl') || 'en',
  )
  const [projects, setProjects] = useState<Project[]>(() => {
    const raw = localStorage.getItem('projects')
    return raw ? (JSON.parse(raw) as Project[]) : []
  })

  const login = (data: User) => {
    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }
  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      return next
    })
  }
  const switchLang = (l: 'en' | 'pl') => {
    setLang(l)
    localStorage.setItem('lang', l)
  }

  const addProject = (data: Omit<Project, 'id' | 'createdAt' | 'courses'>) => {
    const newProject: Project = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      courses: 0,
    }
    setProjects((prev) => {
      const updated = [...prev, newProject]
      localStorage.setItem('projects', JSON.stringify(updated))
      return updated
    })
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id)
      localStorage.setItem('projects', JSON.stringify(updated))
      return updated
    })
  }

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        theme,
        toggleTheme,
        lang,
        switchLang,
        projects,
        addProject,
        deleteProject,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
