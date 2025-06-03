import type { FC, ReactNode } from 'react'
import { Button } from '@mui/material'

interface Props {
  onAuth: () => void
  children?: ReactNode
}

const GoogleAuthButton: FC<Props> = ({ onAuth, children }) => (
  <Button
    type="button"
    onClick={onAuth}
    aria-label="google auth"
    variant="outlined"
    sx={{ mt: 2 }}
    fullWidth
  >
    {children || 'Continue with Google (mock)'}
  </Button>
)

export default GoogleAuthButton
