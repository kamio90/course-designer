import { useEffect, useState } from 'react'
import { fetchPublicProjects } from '../api/fakeApi'
import type { Project } from '../api/fakeApi'
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Button,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'

export default function SearchSidebar() {
  const { addProject, lang } = useApp()
  const t = translations[lang]
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [query, setQuery] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    fetchPublicProjects().then(setProjects)
  }, [])

  const filtered = projects.filter((p) =>
    p.location.toLowerCase().includes(query.toLowerCase()),
  )

  const width = collapsed ? 56 : isMdUp ? 240 : '100%'

  return (
    <Paper
      component="aside"
      elevation={1}
      sx={{ width, flexShrink: 0, transition: 'width 0.3s', overflow: 'hidden' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        {collapsed ? (
          <IconButton onClick={() => setCollapsed(false)} aria-label={t.expandSidebar ?? 'Expand sidebar'}>
            <ChevronLeftIcon />
          </IconButton>
        ) : (
          <>
            <Typography variant="h6">{t.searchProjects}</Typography>
            <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar ?? 'Collapse sidebar'}>
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>
      {!collapsed && (
        <>
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
        </>
      )}
    </Paper>
  )
}
