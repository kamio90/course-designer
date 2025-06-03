import { useState } from 'react'
import {
  Drawer,
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

  if (collapsed) {
    return (
      <Drawer variant="permanent" open={false} anchor="left">
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <IconButton onClick={() => setCollapsed(false)} aria-label={t.expandSidebar}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Drawer>
    )
  }

  return (
    <Drawer variant="permanent" anchor="left" open>
      <Box sx={{ width: 240 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
          <Typography variant="h6">{t.layoutTools}</Typography>
          <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
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
      </Box>
    </Drawer>
  )
}
