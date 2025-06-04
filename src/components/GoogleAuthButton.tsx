import type { FC, ReactNode } from 'react'
import { Button } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'

interface Props {
  onAuth: () => void
  children?: ReactNode
}

const GoogleAuthButton: FC<Props> = ({ onAuth, children }) => (
  <Button
    type="button"
    onClick={onAuth}
    aria-label="google auth"
    variant="contained"
    color="error"
    startIcon={<GoogleIcon />}
    sx={{ mt: 2, textTransform: 'none' }}
    fullWidth
  >
    {children || 'Continue with Google (mock)'}
  </Button>
)

export default GoogleAuthButton
