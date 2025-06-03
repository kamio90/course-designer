import { useEffect, useState } from 'react'
import { fetchPublicProjects } from '../api/fakeApi'
import type { Project } from '../api/fakeApi'
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Button,
  Typography,
  Box,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
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
      <Drawer variant="permanent" anchor="right" open={false}
        PaperProps={{ sx: { width: 40 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <IconButton onClick={() => setCollapsed(false)} aria-label={t.expandSidebar ?? 'Expand sidebar'}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      </Drawer>
    )
  }

  return (
    <Drawer variant="permanent" anchor="right" open>
      <Box sx={{ width: 240 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
          <Typography variant="h6">{t.searchProjects}</Typography>
          <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar ?? 'Collapse sidebar'}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <TextField
          type="search"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
        />
        <List dense>
          {filtered.map((p) => (
            <ListItem key={p.id}>
              <ListItemText primary={`${p.title} – ${p.location}`} />
              <Button onClick={() => addProject(p)} size="small">{t.add}</Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
