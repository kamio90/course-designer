import { useState } from 'react'
import type { FormEvent } from 'react'
import { login as apiLogin } from '../api/fakeApi'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'
import GoogleAuthButton from '../components/GoogleAuthButton'

export default function LoginView() {
  const { login, lang } = useApp()
  const t = translations[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const user = await apiLogin({ email, password })
      login(user)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="login form" className="auth-form">
      <div>
        <label>
          {t.email}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          {t.password}
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <button
          type="button"
          onClick={() => setShowPwd((s) => !s)}
          aria-label={showPwd ? t.hidePassword : t.showPassword}
        >
          {showPwd ? t.hidePassword : t.showPassword}
        </button>
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit">{t.login}</button>
      <GoogleAuthButton onAuth={() => login({ email: 'google@example.com', username: 'googleUser' })} />
    </form>
  )
}
