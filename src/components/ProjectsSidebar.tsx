import { useState } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import { Link } from 'react-router-dom'
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteIcon from '@mui/icons-material/Delete'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'

export default function ProjectsSidebar() {
  const { projects, deleteProject, lang } = useApp()
  const t = translations[lang]
  const [collapsed, setCollapsed] = useState(false)
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const width = collapsed ? 56 : isMdUp ? 240 : '100%'

  return (
    <Paper component="aside" elevation={1} sx={{ width, flexShrink: 0, transition: 'width 0.3s', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        {collapsed ? (
          <IconButton onClick={() => setCollapsed(false)} aria-label={t.expandSidebar ?? 'Expand sidebar'}>
            <ChevronRightIcon />
          </IconButton>
        ) : (
          <>
            <Typography variant="h6">{t.myProjects}</Typography>
            <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar ?? 'Collapse sidebar'}>
              <ChevronLeftIcon />
            </IconButton>
          </>
        )}
      </Box>
      {!collapsed && (
        <List dense>
          {projects.length === 0 && <ListItemText primary={t.noProjects} />}
          {projects.map((p) => (
            <ListItem
              key={p.id}
              secondaryAction={
                <IconButton edge="end" aria-label={t.delete} onClick={() => deleteProject(p.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={<Link to={`/project/${p.id}`}>{p.title}</Link>}
                secondary={`${p.location} · ${p.level} · ${t.courses}: ${p.courses} · ${new Date(p.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  )
}
