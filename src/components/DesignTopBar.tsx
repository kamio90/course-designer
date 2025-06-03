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
import StraightenIcon from '@mui/icons-material/Straighten'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'

interface Props {
  showGrid: boolean
  toggleGrid: () => void
  scale: number
  toggleScale: () => void
  snap: boolean
  toggleSnap: () => void
  autoStraight: boolean
  toggleAuto: () => void
}

export default function DesignTopBar({
  showGrid,
  toggleGrid,
  scale,
  toggleScale,
  snap,
  toggleSnap,
  autoStraight,
  toggleAuto,
}: Props) {
  const [helpVisible, setHelpVisible] = useState(false)
  const { lang } = useApp()
  const t = translations[lang]

  return (
    <AppBar position="static" className="design-topbar">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>
          {scale === 10 ? '1m = 10px' : 'px'}
        </Typography>
        <IconButton color="inherit" onClick={toggleScale} aria-label={t.toggleScale}>
          <StraightenIcon />
        </IconButton>
        <IconButton color="inherit" onClick={toggleGrid} aria-label={showGrid ? t.gridOff : t.gridOn}>
          {showGrid ? <GridOffIcon /> : <GridOnIcon />}
        </IconButton>
        <IconButton
          color={snap ? 'secondary' : 'inherit'}
          onClick={toggleSnap}
          aria-label={t.snap}
        >
          <span style={{ fontSize: 16 }}>S</span>
        </IconButton>
        <IconButton
          color={autoStraight ? 'secondary' : 'inherit'}
          onClick={toggleAuto}
          aria-label={t.straighten}
        >
          <span style={{ fontSize: 16 }}>A</span>
        </IconButton>
        <IconButton color="inherit" onClick={() => setHelpVisible(true)} aria-label={t.help}>
          <HelpOutlineIcon />
        </IconButton>
      </Toolbar>
      <Dialog open={helpVisible} onClose={() => setHelpVisible(false)}>
        <DialogTitle>{t.help}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Left click to add point, drag to move. Right click to delete. Use S to snap to grid and A to auto-straighten.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpVisible(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  )
}
