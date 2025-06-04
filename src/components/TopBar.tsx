import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  Select,
  MenuItem,
  Button,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SettingsIcon from '@mui/icons-material/Settings'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'
import PreferencesDialog from './PreferencesDialog'

export default function TopBar() {
  const { user, toggleTheme, theme, lang, switchLang, logout } = useApp()
  const t = translations[lang]
  const [collapsed, setCollapsed] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)

  if (collapsed) {
    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setCollapsed(false)}
            aria-label={t.expandTopbar ?? 'Expand top bar'}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CDO
          </Typography>
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setCollapsed(true)}
          aria-label={t.collapseSidebar ?? 'Collapse top bar'}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t.appName}
        </Typography>
        <Typography sx={{ mr: 2 }}>
          {user ? user.username || user.email : ''}
        </Typography>
        <Select
          value={lang}
          onChange={(e) => switchLang(e.target.value as 'en' | 'pl')}
          size="small"
          sx={{ color: 'inherit', mr: 2 }}
        >
          <MenuItem value="pl">PL</MenuItem>
          <MenuItem value="en">EN</MenuItem>
        </Select>
        <Switch
          checked={theme === 'dark'}
          onChange={toggleTheme}
          inputProps={{ 'aria-label': 'theme toggle' }}
        />
        <IconButton color="inherit" onClick={() => setPrefsOpen(true)} aria-label={t.preferences}>
          <SettingsIcon />
        </IconButton>
        <Button color="inherit" onClick={logout} sx={{ ml: 2 }}>
          {t.logout}
        </Button>
      </Toolbar>
      <PreferencesDialog open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </AppBar>
  )
}
