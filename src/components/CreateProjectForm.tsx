import { Button, Select, MenuItem, Box, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { translations } from '../i18n'
import { useApp } from '../context/AppContext'

interface FormInputs {
  title: string
  location: string
  level: string
}

export default function CreateProjectForm() {
  const { lang, addProject } = useApp()
  const t = translations[lang]

  const schema = yup.object({
    title: yup.string().required(),
    location: yup.string().required(),
    level: yup.string().required(),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    defaultValues: { level: 'CSI1*' },
    mode: 'onBlur',
  })

  const onSubmit = (data: FormInputs) => {
    addProject(data)
    alert(t.projectCreated)
    reset({ title: '', location: '', level: 'CSI1*' })
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      aria-label="create project form"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}
    >
      <TextField
        label={t.title}
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
      />
      <TextField
        label={t.location}
        {...register('location')}
        error={!!errors.location}
        helperText={errors.location?.message}
      />
      <Select {...register('level')} label={t.competitionLevel} defaultValue="CSI1*">
        <MenuItem value="CSI1*">CSI1*</MenuItem>
        <MenuItem value="national">National</MenuItem>
        <MenuItem value="regional">Regional</MenuItem>
        <MenuItem value="local">Local</MenuItem>
      </Select>
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {t.createProject}
      </Button>
      <Button type="button" onClick={() => alert('Import template soon')} variant="outlined">
        {t.importTemplate ?? 'Import from template'}
      </Button>
    </Box>
  )
}
