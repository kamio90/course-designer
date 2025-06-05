import { useState } from 'react'
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Backdrop,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  useTheme,
  Link as MuiLink,
  Collapse,
  Grow,
} from '@mui/material'
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import GoogleAuthButton from '../components/GoogleAuthButton'
import FacebookAuthButton from '../components/FacebookAuthButton'
import { useApp } from '../context/AppContext'
import { register as apiRegister } from '../api/fakeApi'
import { translations } from '../i18n'
import lightLogo from '../assets/logo-light.svg'
import darkLogo from '../assets/logo-dark.svg'

interface FormInputs {
  email: string
  username: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
}

export default function RegisterView() {
  const navigate = useNavigate()
  const { lang, switchLang } = useApp()
  const t = translations[lang]
  const theme = useTheme()
  const logo = theme.palette.mode === 'dark' ? darkLogo : lightLogo
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const USERNAME_MIN = 3
  const PASSWORD_MIN = 8

  const schema = yup.object({
    email: yup.string().email(t.emailInvalid).required(t.emailRequired),
    username: yup
      .string()
      .min(USERNAME_MIN, t.usernameMin)
      .required(t.usernameRequired),
    password: yup
      .string()
      .min(PASSWORD_MIN, t.passwordMin)
      .matches(/(?=.*\d)(?=.*[^A-Za-z0-9])/, t.passwordComplex)
      .required(t.passwordRequired),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t.passwordMismatch)
      .required(t.passwordRequired),
    termsAccepted: yup
      .boolean()
      .oneOf([true], t.tosRequired)
      .required(),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { termsAccepted: false, confirmPassword: '' } as FormInputs,
  })

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onSubmit = async (data: FormInputs) => {
    try {
      await apiRegister({
        email: data.email,
        username: data.username,
        password: data.password,
        acceptedTerms: data.termsAccepted,
      })
      navigate('/login')
    } catch (err) {
      let msg = (err as Error).message
      if (msg === 'Invalid email') msg = t.emailInvalid
      else if (msg === 'Invalid username') msg = t.usernameMin
      else if (msg === 'Password too short') msg = t.passwordMin
      else if (msg === 'Terms not accepted') msg = t.tosRequired
      else if (msg === 'User already exists') msg = t.userExists
      else msg = t.registerFailed
      setErrorMsg(msg)
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
            {t.registerTitle}
          </Typography>
          <TextField
            label={t.username}
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
            FormHelperTextProps={{ 'aria-live': 'polite' }}
            autoFocus
          />
          <TextField
            label={t.email}
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            FormHelperTextProps={{ 'aria-live': 'polite' }}
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
          <TextField
            label={t.confirmPassword}
            type={showConfirm ? 'text' : 'password'}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            FormHelperTextProps={{ 'aria-live': 'polite' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? t.hidePassword : t.showPassword}
                    edge="end"
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl error={!!errors.termsAccepted} component="fieldset">
            <FormControlLabel
              control={<Checkbox {...register('termsAccepted')} />}
              label={
                <Typography variant="body2">
                  {t.tosPrefix}{' '}
                  <MuiLink
                    href="/tos"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.termsOfService}
                  </MuiLink>{' '}
                  {t.and}{' '}
                  <MuiLink
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.privacyPolicy}
                  </MuiLink>
                </Typography>
              }
            />
            {errors.termsAccepted && (
              <FormHelperText aria-live="polite">
                {errors.termsAccepted.message}
              </FormHelperText>
            )}
          </FormControl>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t.register}
          </Button>
          <Divider flexItem sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              {t.orRegisterWith}
            </Typography>
          </Divider>
          <GoogleAuthButton
            onAuth={() => {
              alert(t.googleRegisterMock)
            }}
            ariaLabel={t.googleRegister}
            disabled={isSubmitting}
          >
            {t.googleRegister}
          </GoogleAuthButton>
          <FacebookAuthButton
            onAuth={() => {
              alert(t.facebookMock)
            }}
            ariaLabel={t.facebookRegister}
            disabled={isSubmitting}
          >
            {t.facebookRegister}
          </FacebookAuthButton>
          <Button
            variant="text"
            onClick={() => navigate('/login')}
            sx={{ mt: 1 }}
            aria-label={t.backToLogin}
          >
            {t.backToLogin}
          </Button>
          </Stack>
        </Paper>
      </Grow>
      </Box>
  )
}
