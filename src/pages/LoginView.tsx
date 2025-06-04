import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  useTheme,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import lightLogo from '../assets/logo-light.svg'
import darkLogo from '../assets/logo-dark.svg'
import { login as apiLogin } from '../api/fakeApi'
import { useApp } from '../context/AppContext'
import GoogleAuthButton from '../components/GoogleAuthButton'
import FacebookAuthButton from '../components/FacebookAuthButton'
import { translations } from '../i18n'

interface FormInputs {
  username: string
  password: string
}

export default function LoginView() {
  const { login, lang } = useApp()
  const navigate = useNavigate()
  const t = translations[lang]
  const theme = useTheme()
  const logo = theme.palette.mode === 'dark' ? darkLogo : lightLogo
  const [showPwd, setShowPwd] = useState(false)

  const schema = yup.object({
    username: yup.string().required(),
    password: yup.string().min(6).required(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: FormInputs) => {
    await new Promise((res) => setTimeout(res, 1000))
    try {
      await apiLogin({ email: data.username, password: data.password })
      alert('Logged in')
      login({ email: data.username, username: data.username })
      navigate('/dashboard')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2 }}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        elevation={3}
      >
        <Stack spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <img src={logo} alt={t.appName} width={40} height={40} />
            <Typography variant="h6" component="span">
              {t.appName}
            </Typography>
          </Stack>
          <Typography variant="h5" component="h1">
            {t.loginTitle}
          </Typography>
          <TextField
            label={t.username}
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
            autoFocus
          />
          <TextField
            label={t.password}
            type={showPwd ? 'text' : 'password'}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
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
          <Box sx={{ alignSelf: 'flex-end' }}>
            <Button variant="text" size="small">
              {t.forgotPassword}
            </Button>
          </Box>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t.login}
          </Button>
          <Divider flexItem sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              {t.orLoginWith}
            </Typography>
          </Divider>
          <GoogleAuthButton
            onAuth={() => {
              alert(t.googleMock)
            }}
          >
            {t.googleSignIn}
          </GoogleAuthButton>
          <FacebookAuthButton
            onAuth={() => {
              alert(t.facebookMock)
            }}
          >
            {t.facebookSignIn}
          </FacebookAuthButton>
          <Button
            variant="text"
            onClick={() => navigate('/register')}
            sx={{ mt: 1 }}
          >
            {t.registerLink}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
