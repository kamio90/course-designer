import { useState } from 'react'
import {
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Box,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'

interface Props {
  onSave: () => void
  canSave: boolean
}

export default function LayoutTools({ onSave, canSave }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const { lang } = useApp()
  const t = translations[lang]

  const items = [
    { key: 'water', label: t.water },
    { key: 'grass', label: t.grass },
    { key: 'entrance', label: t.entrance },
    { key: 'exit', label: t.exit },
    { key: 'gazebo', label: t.gazebo },
  ]

  const width = collapsed ? 40 : 240

  return (
    <Paper component="aside" elevation={1} sx={{ width, flexShrink: 0, transition: 'width 0.3s', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        {collapsed ? (
          <IconButton onClick={() => setCollapsed(false)} aria-label={t.expandSidebar}>
            <ChevronRightIcon />
          </IconButton>
        ) : (
          <>
            <Typography variant="h6">{t.layoutTools}</Typography>
            <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar}>
              <ChevronLeftIcon />
            </IconButton>
          </>
        )}
      </Box>
      {!collapsed && (
        <>
          <Button onClick={onSave} disabled={!canSave} fullWidth sx={{ mb: 1 }}>
            {t.saveLayout}
          </Button>
          <List dense>
            {items.map((item) => (
              <ListItem
                key={item.key}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', item.key)}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  )
}
