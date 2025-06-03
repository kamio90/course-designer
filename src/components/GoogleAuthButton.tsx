import type { FC } from 'react'

interface Props {
  onAuth: () => void
}

const GoogleAuthButton: FC<Props> = ({ onAuth }) => {
  return (
    <button type="button" onClick={onAuth} aria-label="google auth" className="google-btn">
      Continue with Google (mock)
    </button>
  )
}

export default GoogleAuthButton
