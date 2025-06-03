import { useEffect, useState } from 'react'
import { fetchPublicProjects } from '../api/fakeApi'
import type { Project } from '../api/fakeApi'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'

export default function SearchSidebar() {
  const { addProject, lang } = useApp()
  const t = translations[lang]
  const [query, setQuery] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    fetchPublicProjects().then(setProjects)
  }, [])

  const filtered = projects.filter((p) =>
    p.location.toLowerCase().includes(query.toLowerCase()),
  )

  if (collapsed) {
    return (
      <aside className="sidebar right" aria-label="search sidebar" data-collapsed>
        <button onClick={() => setCollapsed(false)} aria-label={t.expandSidebar ?? 'Expand sidebar'}>◀</button>
      </aside>
    )
  }

  return (
    <aside className="sidebar right" aria-label="search sidebar">
      <div className="sidebar-header">
        <h2>{t.searchProjects}</h2>
        <button onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar ?? 'Collapse sidebar'}>▶</button>
      </div>
      <input
        type="search"
        placeholder={t.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {filtered.map((p) => (
          <li key={p.id}>
            {p.title} – {p.location}{' '}
            <button onClick={() => addProject(p)}>{t.add}</button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
