import type { FC, ReactNode } from 'react'
import { Button } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'

interface Props {
  onAuth: () => void
  ariaLabel: string
  children?: ReactNode
}

const GoogleAuthButton: FC<Props> = ({ onAuth, ariaLabel, children }) => (
  <Button
    type="button"
    onClick={onAuth}
    aria-label={ariaLabel}
    variant="contained"
    color="error"
    startIcon={<GoogleIcon />}
    sx={{ mt: 2, textTransform: 'none' }}
    fullWidth
  >
    {children}
  </Button>
)

export default GoogleAuthButton
