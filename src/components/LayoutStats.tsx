import { useMemo, useState } from 'react'
import type { Point } from './LayoutCanvas'
import {
  Drawer,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'

interface Props {
  points: Point[]
  scale: number
}

export default function LayoutStats({ points, scale }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const { lang } = useApp()
  const t = translations[lang]

  const stats = useMemo(() => {
    let length = 0
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x
      const dy = points[i].y - points[i - 1].y
      length += Math.hypot(dx, dy)
    }
    const closed =
      points.length > 2 &&
      points[0].x === points[points.length - 1].x &&
      points[0].y === points[points.length - 1].y
    let area = 0
    if (closed) {
      for (let i = 0; i < points.length - 1; i++) {
        area += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y
      }
      area = Math.abs(area / 2)
    }
    return { length, closed, area }
  }, [points])

  if (collapsed) {
    return (
      <Drawer variant="permanent" anchor="right" open={false} PaperProps={{ sx: { width: 40 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <IconButton onClick={() => setCollapsed(false)} aria-label={t.expandSidebar}>
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
          <Typography variant="h6">{t.layoutStats}</Typography>
          <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <List dense>
          <ListItem>
            <ListItemText primary={`${t.totalPoints}: ${points.length}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`${t.totalLength}: ${(stats.length / scale).toFixed(2)} m`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`${t.area}: ${(stats.area / (scale * scale)).toFixed(2)} m²`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`${t.closedShape}: ${stats.closed ? 'Yes' : 'No'}`} />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}
