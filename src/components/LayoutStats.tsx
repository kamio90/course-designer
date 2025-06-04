import { useMemo, useState } from 'react'
import type { Point } from './LayoutCanvas'
import {
  Paper,
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
      points.length > 3 &&
      points[0].x === points[points.length - 1].x &&
      points[0].y === points[points.length - 1].y
    const unique = closed ? points.length - 1 : points.length
    let area = 0
    if (closed) {
      for (let i = 0; i < points.length - 1; i++) {
        area += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y
      }
      area = Math.abs(area / 2)
    }
    const edges = unique > 1 ? unique : 0
    return { length, closed, area, edges, unique }
  }, [points])

  const width = collapsed ? 40 : 240

  return (
    <Paper
      component="aside"
      elevation={1}
      sx={{ width, flexShrink: 0, transition: 'width 0.3s', overflow: 'hidden' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
        {collapsed ? (
          <IconButton onClick={() => setCollapsed(false)} aria-label={t.expandSidebar}>
            <ChevronLeftIcon />
          </IconButton>
        ) : (
          <>
            <Typography variant="h6">{t.layoutStats}</Typography>
            <IconButton onClick={() => setCollapsed(true)} aria-label={t.collapseSidebar}>
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>
      {!collapsed && (
        <List dense>
          <ListItem>
            <ListItemText primary={`${t.totalPoints}: ${stats.unique}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`${t.perimeter}: ${(stats.length / scale).toFixed(2)} m`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`${t.totalEdges}: ${stats.edges}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`${t.area}: ${(stats.area / (scale * scale)).toFixed(2)} m²`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`${t.closedShape}: ${stats.closed ? t.yes : t.no}`} />
          </ListItem>
        </List>
      )}
    </Paper>
  )
}
