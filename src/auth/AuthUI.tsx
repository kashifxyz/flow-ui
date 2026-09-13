import { type ReactNode, useState } from 'react'
import { Link, Navigate } from '@tanstack/react-router'
import { Icon } from '../components/icons/Icon'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { Wordmark } from '../components/Wordmark'
import { useCurrentUser } from '../hooks/useCurrentUser'

export function AuthShell({
  title,
  lead,
  children,
}: {
  title: string
  lead: string
  children: ReactNode
}) {
  const me = useCurrentUser()
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
        <AuthGraphic />
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

const graphicNodes = [
  { id: 'page', x: 16, y: 18, icon: 'PAGE', label: 'Launch notes' },
  { id: 'database', x: 84, y: 23, icon: 'DATABASE', label: 'Records' },
  { id: 'canvas', x: 16, y: 82, icon: 'CANVAS', label: 'Roadmap' },
  { id: 'task', x: 84, y: 82, icon: 'TASK', label: 'Ship v1' },
] as const

const graphicHub = { x: 50, y: 50 }

function AuthGraphic() {
  return (
    <div className="auth-graphic" aria-hidden="true">
      <svg className="auth-graphic-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        {graphicNodes.map((node) => (
          <line key={node.id} x1={graphicHub.x} y1={graphicHub.y} x2={node.x} y2={node.y} />
        ))}
      </svg>
      <div className="graphic-node graphic-hub" style={{ left: `${graphicHub.x}%`, top: `${graphicHub.y}%` }}>
        <Icon name="LINK" size={16} />
        <span>Workspace</span>
      </div>
      {graphicNodes.map((node, i) => (
        <div
          key={node.id}
          className="graphic-node"
          style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${i * 0.6}s` }}
        >
          <Icon name={node.icon} size={16} />
          <span>{node.label}</span>
        </div>
      ))}
    </div>
  )
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  autoComplete,
  error,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  autoComplete: string
  error?: string
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
          onBlur={onBlur}
        />
        <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}>
          <Icon name={visible ? 'EYE_OFF' : 'EYE'} size={18} />
        </button>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
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
