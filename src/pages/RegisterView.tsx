import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Alert,
  Box,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { register as apiRegister } from '../api/fakeApi'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'
import GoogleAuthButton from '../components/GoogleAuthButton'

export default function RegisterView() {
  const { login, lang } = useApp()
  const navigate = useNavigate()
  const t = translations[lang]
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const user = await apiRegister({
        email,
        username,
        password,
        acceptedTerms: accepted,
      })
      login(user)
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Box component="form" onSubmit={handleSubmit} aria-label="register form" className="auth-form">
      <TextField
        label={t.email}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label={t.username}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label={t.password}
        type={showPwd ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? t.hidePassword : t.showPassword}
                edge="end"
              >
                {showPwd ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            required
          />
        }
        label={t.tos}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        {t.register}
      </Button>
        <GoogleAuthButton
          onAuth={() => {
            login({ email: 'google@example.com', username: 'googleUser' })
            navigate('/dashboard')
          }}
        />
      </Box>
    </Box>
  )
}
