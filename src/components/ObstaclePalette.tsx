import { useState } from 'react'
import {
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'

export interface ObstacleType {
  key: string
  label: string
}

const OBSTACLES: string[] = [
  'vertical',
  'oxer',
  'triple',
  'wall',
  'gate',
  'waterSmall',
  'waterLarge',
]

export default function ObstaclePalette() {
  const [collapsed, setCollapsed] = useState(false)
  const { lang } = useApp()
  const t = translations[lang]
  const navigate = useNavigate()
  const { projectId } = useParams()
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
            <Typography variant="h6">{t.obstaclePalette}</Typography>
            <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar}>
              <ChevronLeftIcon />
            </IconButton>
          </>
        )}
      </Box>
      {!collapsed && (
        <>
          <Button
            onClick={() => navigate(`/project/${projectId}`)}
            fullWidth
            sx={{ mb: 1 }}
          >
            {t.backToLayout}
          </Button>
          <List dense>
            {OBSTACLES.map((type) => (
              <ListItem
                key={type}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', type)}
                button
              >
                <ListItemText
                  primary={t[type as keyof typeof translations['en']]}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  )
}
