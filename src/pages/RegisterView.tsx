import { useState } from 'react'
import {
  Container,
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
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { useApp } from '../context/AppContext'
import { register as apiRegister } from '../api/fakeApi'
import { translations } from '../i18n'

interface FormInputs {
  email: string
  username: string
  password: string
  termsAccepted: boolean
}

export default function RegisterView() {
  const { lang } = useApp()
  const t = translations[lang]
  const [showPwd, setShowPwd] = useState(false)

  const schema = yup.object({
    email: yup.string().email().required(),
    username: yup.string().required(),
    password: yup.string().min(6).required(),
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
    mode: 'onBlur',
    defaultValues: { termsAccepted: false } as FormInputs,
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
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1" textAlign="center">
            {t.registerTitle}
          </Typography>
          <TextField
            label={t.email}
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            autoFocus
          />
          <TextField
            label={t.username}
            {...register('username')}
            error={!!errors.username}
            helperText={errors.username?.message}
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
          >
            {t.googleRegister}
          </GoogleAuthButton>
        </Stack>
      </Paper>
    </Container>
  )
}
