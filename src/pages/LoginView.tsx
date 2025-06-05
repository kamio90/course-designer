import { useState, useEffect } from 'react'
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
  Backdrop,
  CircularProgress,
  Collapse,
  useTheme,
  Alert,
  Select,
  MenuItem,
  Grow,
} from '@mui/material'
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material'
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
import pkg from '../../package.json'
import { logLoginAttempt } from '../utils/analytics'

interface FormInputs {
  email: string
  password: string
}

export default function LoginView() {
  const { login, lang, switchLang, user } = useApp()
  const navigate = useNavigate()
  const t = translations[lang]
  const theme = useTheme()
  const logo = theme.palette.mode === 'dark' ? darkLogo : lightLogo
  const version = pkg.version
  const [showPwd, setShowPwd] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const schema = yup.object({
    email: yup.string().required(t.emailRequired).email(t.emailInvalid),
    password: yup
      .string()
      .min(8, t.passwordMin)
      .required(t.passwordRequired),
  })

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (data: FormInputs) => {
    try {
      const user = await apiLogin({ email: data.email, password: data.password })
      login(user)
      logLoginAttempt(data.email, true)
      navigate('/dashboard')
    } catch (err) {
      let msg = (err as Error).message
      if (msg === 'Invalid credentials') msg = t.invalidCredentials
      else if (msg === 'Invalid email') msg = t.emailInvalid
      else if (msg === 'Password too short') msg = t.passwordMin
      else msg = t.loginFailed
      setErrorMsg(msg)
      logLoginAttempt(data.email, false)
    }
  }

  const handleDemo = () => {
    const demoUser = { email: 'demo@example.com', username: 'demo' }
    login(demoUser)
    logLoginAttempt(demoUser.email, true)
    navigate('/dashboard')
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
      <Grow in>
        <Paper
          sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2, position: 'relative' }}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              if (isDirty || errorMsg) {
                reset()
                setErrorMsg(null)
              } else {
                navigate(-1)
              }
            }
          }}
          elevation={3}
        >
        <Backdrop open={isSubmitting} sx={{ position: 'absolute', zIndex: 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
          <IconButton aria-label={t.back} onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
        </Box>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Select
            value={lang}
            onChange={(e) => switchLang(e.target.value as 'en' | 'pl')}
            size="small"
            variant="standard"
            inputProps={{ 'aria-label': t.language }}
          >
            <MenuItem value="en">EN</MenuItem>
            <MenuItem value="pl">PL</MenuItem>
          </Select>
        </Box>
        <Box sx={{ width: '100%', minHeight: 56 }}>
          <Collapse in={!!errorMsg} unmountOnExit>
            <Alert
              severity="error"
              onClose={() => setErrorMsg(null)}
              role="alert"
              sx={{ width: '100%' }}
            >
              {errorMsg}
            </Alert>
          </Collapse>
        </Box>
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
            label={t.email}
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            FormHelperTextProps={{ 'aria-live': 'polite' }}
            autoFocus
          />
          <TextField
            label={t.password}
            type={showPwd ? 'text' : 'password'}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            FormHelperTextProps={{ 'aria-live': 'polite' }}
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
            <Button variant="text" size="small" aria-label={t.forgotPassword}>
              {t.forgotPassword}
            </Button>
          </Box>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            aria-label={t.login}
          >
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
            ariaLabel={t.googleSignIn}
          >
            {t.googleSignIn}
          </GoogleAuthButton>
          <FacebookAuthButton
            onAuth={() => {
              alert(t.facebookMock)
            }}
            ariaLabel={t.facebookSignIn}
          >
            {t.facebookSignIn}
          </FacebookAuthButton>
          <Button
            type="button"
            variant="outlined"
            onClick={handleDemo}
            sx={{ mt: 1 }}
            aria-label={t.demoAccount}
            fullWidth
          >
            {t.demoAccount}
          </Button>
          <Button
            variant="text"
            onClick={() => navigate('/register')}
            sx={{ mt: 1 }}
            aria-label={t.registerLink}
          >
            {t.registerLink}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            {t.appVersion} {version}
          </Typography>
        </Stack>
        </Paper>
      </Grow>
    </Box>
  )
}
