import type { FC, ReactNode } from 'react'
import { Button } from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'

interface Props {
  onAuth: () => void
  ariaLabel: string
  children?: ReactNode
}

const FacebookAuthButton: FC<Props> = ({ onAuth, ariaLabel, children }) => (
  <Button
    type="button"
    onClick={onAuth}
    aria-label={ariaLabel}
    variant="contained"
    color="primary"
    startIcon={<FacebookIcon />}
    sx={{ textTransform: 'none' }}
    fullWidth
  >
    {children}
  </Button>
)

export default FacebookAuthButton
