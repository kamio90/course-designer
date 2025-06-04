import type { FC, ReactNode } from 'react'
import { Button } from '@mui/material'
import FacebookIcon from '@mui/icons-material/Facebook'

interface Props {
  onAuth: () => void
  children?: ReactNode
}

const FacebookAuthButton: FC<Props> = ({ onAuth, children }) => (
  <Button
    type="button"
    onClick={onAuth}
    aria-label="facebook auth"
    variant="contained"
    color="primary"
    startIcon={<FacebookIcon />}
    sx={{ textTransform: 'none' }}
    fullWidth
  >
    {children || 'Continue with Facebook (mock)'}
  </Button>
)

export default FacebookAuthButton
