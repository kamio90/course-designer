import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { login as apiLogin } from '../api/fakeApi'
import { useApp } from '../context/AppContext'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { translations } from '../i18n'

interface FormInputs {
  username: string
  password: string
}

export default function LoginView() {
  const { login, lang } = useApp()
  const navigate = useNavigate()
  const t = translations[lang]
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
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1" textAlign="center">
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
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t.login}
          </Button>
          <GoogleAuthButton
            onAuth={() => {
              alert(t.googleMock)
            }}
          >
            {t.googleSignIn}
          </GoogleAuthButton>
        </Stack>
      </Paper>
    </Container>
  )
}
