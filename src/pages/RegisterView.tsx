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
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material'
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import GoogleAuthButton from '../components/GoogleAuthButton'
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
  const { lang, switchLang } = useApp()
  const t = translations[lang]
  const theme = useTheme()
  const logo = theme.palette.mode === 'dark' ? darkLogo : lightLogo
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const schema = yup.object({
    email: yup.string().email(t.emailInvalid).required(t.emailRequired),
    username: yup.string().required(),
    password: yup.string().min(8, t.passwordMin).required(t.passwordRequired),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t.passwordMismatch)
      .required(t.passwordRequired),
    termsAccepted: yup
      .boolean()
      .oneOf([true], t.tos)
      .required(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { termsAccepted: false, confirmPassword: '' } as FormInputs,
  })

  const onSubmit = async (data: FormInputs) => {
    await new Promise((res) => setTimeout(res, 1000))
    try {
      await apiRegister({
        email: data.email,
        username: data.username,
        password: data.password,
        acceptedTerms: data.termsAccepted,
      })
      alert('Registered')
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
        sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 2, position: 'relative' }}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        elevation={3}
      >
        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
          <IconButton aria-label={t.back} onClick={() => window.history.back()}>
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
            autoFocus
          />
          <TextField
            label={t.email}
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
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
              label={t.tos}
            />
            {errors.termsAccepted && (
              <FormHelperText>{errors.termsAccepted.message}</FormHelperText>
            )}
          </FormControl>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t.register}
          </Button>
          <GoogleAuthButton
            onAuth={() => {
              alert(t.googleRegisterMock)
            }}
            ariaLabel={t.googleRegister}
          >
            {t.googleRegister}
          </GoogleAuthButton>
        </Stack>
      </Paper>
    </Box>
  )
}
