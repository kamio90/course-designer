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
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteIcon from '@mui/icons-material/Delete'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PrintIcon from '@mui/icons-material/Print'
import EditIcon from '@mui/icons-material/Edit'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'
import type { Obstacle, Connection } from './ObstacleCanvas'
import type { Point } from './LayoutCanvas'

export interface Competition {
  id: string
  name: string
  obstacles: Obstacle[]
  connections: Connection[]
  layout: Point[]
}

interface Props {
  competitions: Competition[]
  active: string
  setActive: (id: string) => void
  add: () => void
  rename: (id: string, name: string) => void
  duplicate: () => void
  deleteComp: (id: string) => void
  exportPDF: () => void
  exportSVG: () => void
  printCourse: () => void
}

export default function CompetitionSidebar({
  competitions,
  active,
  setActive,
  add,
  rename,
  duplicate,
  deleteComp,
  exportPDF,
  exportSVG,
  printCourse,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { lang } = useApp()
  const t = translations[lang]
  const width = collapsed ? 40 : 260

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
              <ListItem
                key={c.id}
                selected={c.id === active}
                button
                onClick={() => setActive(c.id)}
              >
                {editId === c.id ? (
                  <TextField
                    value={c.name}
                    size="small"
                    onChange={(e) => rename(c.id, e.target.value)}
                    onBlur={() => setEditId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditId(null)
                    }}
                    autoFocus
                  />
                ) : (
                  <ListItemText
                    primary={c.name}
                    onDoubleClick={() => setEditId(c.id)}
                  />
                )}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label={t.rename}
                    onClick={() => setEditId(c.id)}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label={t.deleteCompetition}
                    onClick={() => setDeleteId(c.id)}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </ListItemSecondaryAction>
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
            <Button
              onClick={exportPDF}
              startIcon={<FileDownloadIcon />}
              fullWidth
              sx={{ mb: 1 }}
            >
              {t.exportPDF}
            </Button>
            <Button
              onClick={exportSVG}
              startIcon={<FileDownloadIcon />}
              fullWidth
              sx={{ mb: 1 }}
            >
              {t.exportSVG}
            </Button>
            <Button
              onClick={printCourse}
              startIcon={<PrintIcon />}
              fullWidth
              sx={{ mb: 1 }}
            >
              {t.print}
            </Button>
          </Box>
          </>
      )}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>{t.deleteCompetition}?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              if (deleteId) deleteComp(deleteId)
              setDeleteId(null)
            }}
          >
            {t.deleteCompetition}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
