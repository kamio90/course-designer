import { useState } from 'react'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'

export default function CreateProjectForm() {
  const { lang, addProject } = useApp()
  const t = translations[lang]
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [level, setLevel] = useState('CSI1*')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addProject({ title, location, level })
    setTitle('')
    setLocation('')
    setLevel('CSI1*')
  }
  return (
    <form onSubmit={handleSubmit} aria-label="create project form">
      <label>
        {t.title}
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        {t.location}
        <input value={location} onChange={(e) => setLocation(e.target.value)} required />
      </label>
      <label>
        {t.competitionLevel}
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="CSI1*">CSI1*</option>
          <option value="national">National</option>
        </select>
      </label>
      <button type="submit">{t.createProject}</button>
      <button type="button" onClick={() => alert('Import template soon')}>{t.importTemplate ?? 'Import from template'}</button>
    </form>
  )
}
