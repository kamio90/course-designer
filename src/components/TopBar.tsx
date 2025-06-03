import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { translations } from '../i18n'

export default function TopBar() {
  const { user, toggleTheme, theme, lang, switchLang, logout } = useApp()
  const t = translations[lang]
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <header className="topbar" data-collapsed>
        <div className="logo">CDO</div>
        <button
          onClick={() => setCollapsed(false)}
          aria-label={t.expandTopbar ?? 'Expand top bar'}
        >
          ▼
        </button>
      </header>
    )
  }

  return (
    <header className="topbar">
      <div className="logo">Course Designer Online</div>
      <div className="account">{user?.username}</div>
      <select
        value={lang}
        onChange={(e) => switchLang(e.target.value as 'en' | 'pl')}
        aria-label="language switcher"
      >
        <option value="pl">PL</option>
        <option value="en">EN</option>
      </select>
      <button onClick={toggleTheme} aria-label="theme toggle">
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>
      <button onClick={logout}>{t.logout}</button>
    </header>
  )
}
