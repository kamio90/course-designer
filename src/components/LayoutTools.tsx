import { useState } from 'react'
import {
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Typography,
  Box,
} from '@mui/material'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import GrassIcon from '@mui/icons-material/Grass'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import CottageIcon from '@mui/icons-material/Cottage'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'

interface Props {
  onSave: () => void
  onClear: () => void
  onImport: (data: File) => void
  onExport: () => void
  onToggleMeasure: () => void
  measureMode: boolean
  canSave: boolean
}

export default function LayoutTools({
  onSave,
  onClear,
  onImport,
  onExport,
  onToggleMeasure,
  measureMode,
  canSave,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const { lang } = useApp()
  const t = translations[lang]

  const items = [
    { key: 'water', label: t.water, icon: <WaterDropIcon /> },
    { key: 'grass', label: t.grass, icon: <GrassIcon /> },
    { key: 'entrance', label: t.entrance, icon: <LoginIcon /> },
    { key: 'exit', label: t.exit, icon: <LogoutIcon /> },
    { key: 'gazebo', label: t.gazebo, icon: <CottageIcon /> },
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
          <Button
            onClick={() => {
              if (confirm(t.confirmClear)) onClear()
            }}
            fullWidth
            sx={{ mb: 1 }}
          >
            {t.clearArea}
          </Button>
          <Button component="label" fullWidth sx={{ mb: 1 }}>
            {t.importLayout}
            <input
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) onImport(e.target.files[0])
              }}
            />
          </Button>
          <Button onClick={onExport} fullWidth sx={{ mb: 1 }}>
            {t.exportLayout}
          </Button>
          <Button
            onClick={onToggleMeasure}
            fullWidth
            color={measureMode ? 'secondary' : 'primary'}
            sx={{ mb: 1 }}
          >
            {t.measure}
          </Button>
          <List dense>
            {items.map((item) => (
              <ListItem
                key={item.key}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', item.key)}
                button
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  )
}
