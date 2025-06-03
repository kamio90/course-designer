import { useState } from 'react'
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
} from '@mui/material'
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      aria-label="create project form"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}
    >
      <TextField
        label={t.title}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextField
        label={t.location}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <Select
        value={level}
        label={t.competitionLevel}
        onChange={(e) => setLevel(e.target.value)}
      >
        <MenuItem value="CSI1*">CSI1*</MenuItem>
        <MenuItem value="national">National</MenuItem>
      </Select>
      <Button type="submit" variant="contained">
        {t.createProject}
      </Button>
      <Button type="button" onClick={() => alert('Import template soon')} variant="outlined">
        {t.importTemplate ?? 'Import from template'}
      </Button>
    </Box>
  )
}
