import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, Project } from '../api/fakeApi'

interface AppContextProps {
  user: User | null
  login: (user: User) => void
  logout: () => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  highContrast: boolean
  toggleContrast: () => void
  lang: 'en' | 'pl'
  switchLang: (lang: 'en' | 'pl') => void
  shortcuts: Record<string, string>
  setShortcut: (action: string, key: string) => void
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
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('highContrast') === 'true'
  })
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() => {
    const raw = localStorage.getItem('shortcuts')
    return (
      (raw && (JSON.parse(raw) as Record<string, string>)) || {
        undo: 'ctrl+z',
        redo: 'ctrl+y',
        center: 'f',
        measure: 'm',
        clear: 'c',
      }
    )
  })
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
  const toggleContrast = () => {
    setHighContrast((c) => {
      const next = !c
      localStorage.setItem('highContrast', String(next))
      return next
    })
  }
  const switchLang = (l: 'en' | 'pl') => {
    setLang(l)
    localStorage.setItem('lang', l)
  }

  const setShortcut = (action: string, key: string) => {
    setShortcuts((prev) => {
      const next = { ...prev, [action]: key }
      localStorage.setItem('shortcuts', JSON.stringify(next))
      return next
    })
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
    document.body.dataset.hc = highContrast ? 'true' : 'false'
  }, [theme, highContrast])

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        theme,
        toggleTheme,
        highContrast,
        toggleContrast,
        lang,
        switchLang,
        shortcuts,
        setShortcut,
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
