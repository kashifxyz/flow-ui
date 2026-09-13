import { type ReactNode, useState } from 'react'
import { Link, Navigate } from '@tanstack/react-router'
import { Icon } from '../components/icons/Icon'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { Wordmark } from '../components/Wordmark'
import { useMe } from '../auth/useMe'

export function AuthShell({
  title,
  lead,
  children,
}: {
  title: string
  lead: string
  children: ReactNode
}) {
  const me = useMe()
  if (me.isLoading) {
    return <div className="auth-panel">Loading…</div>
  }
  if (me.data) {
    return <Navigate to="/app" />
  }
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Wordmark />
        <div>
          <h2>Work stays connected.</h2>
          <p>Pages, databases, and canvases share one graph. Sign in with email and password on infrastructure you run.</p>
        </div>
      </aside>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-top">
            <Wordmark />
            <ThemeSwitch />
          </div>
          <h1>{title}</h1>
          <p className="lead">{lead}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <div className="auth-password">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}>
          <Icon name={visible ? 'EYE_OFF' : 'EYE'} size={18} />
        </button>
      </div>
    </label>
  )
}

export function AuthLinks({
  left,
  right,
}: {
  left?: { to: string; label: string }
  right?: { to: string; label: string }
}) {
  return (
    <div className="auth-links">
      {left ? <Link to={left.to}>{left.label}</Link> : <span />}
      {right ? <Link to={right.to}>{right.label}</Link> : <span />}
    </div>
  )
}
