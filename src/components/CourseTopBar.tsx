import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import GridOnIcon from '@mui/icons-material/GridOn'
import GridOffIcon from '@mui/icons-material/GridOff'
import LinkIcon from '@mui/icons-material/Link'
import TextField from '@mui/material/TextField'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'

interface Props {
  showGrid: boolean
  toggleGrid: () => void
  scale: number
  setScale: (v: number) => void
  connect: boolean
  toggleConnect: () => void
}

export default function CourseTopBar({
  showGrid,
  toggleGrid,
  scale,
  setScale,
  connect,
  toggleConnect,
}: Props) {
  const [helpVisible, setHelpVisible] = useState(false)
  const { lang } = useApp()
  const t = translations[lang]

  return (
    <AppBar position="static">
      <Toolbar>
        <TextField
          type="number"
          label={t.scaleLabel}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          size="small"
          sx={{ mr: 2, width: 100, input: { color: 'inherit' } }}
        />
        <IconButton color="inherit" onClick={toggleGrid} aria-label={showGrid ? t.gridOff : t.gridOn}>
          {showGrid ? <GridOffIcon /> : <GridOnIcon />}
        </IconButton>
        <IconButton color={connect ? 'secondary' : 'inherit'} onClick={toggleConnect} aria-label={t.connectMode}>
          <LinkIcon />
        </IconButton>
        <IconButton color="inherit" onClick={() => setHelpVisible(true)} aria-label={t.help}>
          <HelpOutlineIcon />
        </IconButton>
      </Toolbar>
      <Dialog open={helpVisible} onClose={() => setHelpVisible(false)}>
        <DialogTitle>{t.help}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t.obstacleHelp}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpVisible(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  )
}
