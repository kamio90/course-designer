import { useState } from 'react'
import {
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  TextField,
  Button,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'

export interface Competition {
  id: string
  name: string
}

interface Props {
  competitions: Competition[]
  active: string
  setActive: (id: string) => void
  add: () => void
  rename: (id: string, name: string) => void
  duplicate: () => void
  exportCourse: () => void
}

export default function CompetitionSidebar({
  competitions,
  active,
  setActive,
  add,
  rename,
  duplicate,
  exportCourse,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const { lang } = useApp()
  const t = translations[lang]
  const width = collapsed ? 40 : 240

  return (
    <Paper component="aside" elevation={1} sx={{ width, flexShrink: 0, transition: 'width 0.3s', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        {collapsed ? (
          <IconButton onClick={() => setCollapsed(false)} aria-label={t.expandSidebar}>
            <ChevronLeftIcon />
          </IconButton>
        ) : (
          <>
            <Typography variant="h6">{t.competitions}</Typography>
            <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar}>
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>
      {!collapsed && (
        <>
          <List dense>
            {competitions.map((c) => (
              <ListItem key={c.id} selected={c.id === active} button onClick={() => setActive(c.id)}>
                <ListItemText primary={c.name} />
              </ListItem>
            ))}
          </List>
          <Box sx={{ p: 1 }}>
            <Button onClick={add} fullWidth sx={{ mb: 1 }}>
              {t.addCompetition}
            </Button>
            <Button onClick={duplicate} fullWidth sx={{ mb: 1 }}>
              {t.duplicate}
            </Button>
            <Button onClick={exportCourse} fullWidth sx={{ mb: 1 }}>
              {t.export}
            </Button>
            {competitions.map((c) => (
              c.id === active && (
                <TextField
                  key={c.id}
                  size="small"
                  fullWidth
                  margin="dense"
                  value={c.name}
                  onChange={(e) => rename(c.id, e.target.value)}
                />
              )
            ))}
          </Box>
        </>
      )}
    </Paper>
  )
}
