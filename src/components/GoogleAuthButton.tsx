import type { FC } from 'react'
import { Button } from '@mui/material'

interface Props {
  onAuth: () => void
}

const GoogleAuthButton: FC<Props> = ({ onAuth }) => {
  return (
    <Button type="button" onClick={onAuth} aria-label="google auth" variant="outlined" sx={{ mt: 2 }} fullWidth>
      Continue with Google (mock)
    </Button>
  )
}

export default GoogleAuthButton
