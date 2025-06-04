import { useState } from 'react'
import { Paper, IconButton, List, ListItem, ListItemText, Typography, Box } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'

interface Props {
  history: unknown[]
  jump: (index: number) => void
}

export default function HistoryPanel({ history, jump }: Props) {
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
            <Typography variant="h6">{t.history}</Typography>
            <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar}>
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>
      {!collapsed && (
        <List dense>
          {history.map((_, i) => (
            <ListItem button key={i} onClick={() => jump(i)}>
              <ListItemText primary={`${t.step} ${i + 1}`} />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  )
}
