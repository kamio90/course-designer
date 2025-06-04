import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'

interface Props {
  open: boolean
  onClose: () => void
}

export default function PreferencesDialog({ open, onClose }: Props) {
  const {
    lang,
    highContrast,
    toggleContrast,
    advancedGestures,
    toggleGestures,
    shortcuts,
    setShortcut,
  } = useApp()
  const t = translations[lang]
  const [local, setLocal] = useState(shortcuts)

  const handleSave = () => {
    Object.entries(local).forEach(([a, k]) => setShortcut(a, k))
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t.preferences}</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={<Switch checked={highContrast} onChange={toggleContrast} />}
          label={t.highContrast}
        />
        <FormControlLabel
          control={<Switch checked={advancedGestures} onChange={toggleGestures} />}
          label={t.advancedGestures}
        />
        <List dense>
          {Object.entries(local).map(([action, key]) => (
            <ListItem key={action} secondaryAction={
              <TextField
                value={key}
                size="small"
                onChange={(e) =>
                  setLocal({ ...local, [action]: e.target.value })
                }
              />
            }>
              <ListItemText primary={t[action] ?? action} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t.cancel}</Button>
        <Button onClick={handleSave}>{t.save}</Button>
      </DialogActions>
    </Dialog>
  )
}
