import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'

export default function ProjectsSidebar() {
  const { projects, deleteProject, lang } = useApp()
  const t = translations[lang]
  const [collapsed, setCollapsed] = useState(false)
  if (collapsed) {
    return (
      <aside className="sidebar left" aria-label="projects sidebar" data-collapsed>
        <button onClick={() => setCollapsed(false)} aria-label={t.expandSidebar ?? 'Expand sidebar'}>
          ▶
        </button>
      </aside>
    )
  }
  return (
    <aside className="sidebar left" aria-label="projects sidebar">
      <div className="sidebar-header">
        <h2>{t.myProjects}</h2>
        <button onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar ?? 'Collapse sidebar'}>
          ◀
        </button>
      </div>
      <ul>
        {projects.length === 0 && <li>{t.noProjects}</li>}
        {projects.map((p) => (
          <li key={p.id}>
            <button onClick={() => deleteProject(p.id)} aria-label={t.delete}>✕</button>{' '}
            <Link to={`/project/${p.id}`}>{p.title}</Link>{' '}
            – {p.location} ({p.level}) [{new Date(p.createdAt).toLocaleDateString()}]
          </li>
        ))}
      </ul>
    </aside>
  )
}
