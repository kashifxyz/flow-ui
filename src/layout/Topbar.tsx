import { Link } from '@tanstack/react-router'
import { Icon } from '../components/icons/Icon'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { useLogout } from '../hooks/useLogout'
import { notifyError, notifySuccess } from '../lib/toast'
import { useTopbarTitle } from './page-title-context'
import type { CurrentUser } from '../hooks/useCurrentUser'

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Topbar({ user, onMenuClick }: { user: CurrentUser; onMenuClick?: () => void }) {
  const logout = useLogout()
  const title = useTopbarTitle()

  return (
    <header className="app-bar">
      <div className="app-bar-left">
        <button type="button" className="menu-toggle" aria-label="Toggle navigation" onClick={onMenuClick}>
          <Icon name="MENU" size={20} />
        </button>
        <h1>{title}</h1>
      </div>
      <div className="app-user">
        <ThemeSwitch />
        <Link to="/app/profile" className="user-chip" title={`${user.display_name} — view profile`}>
          <span className="user-avatar" aria-hidden="true">
            {initialsOf(user.display_name)}
          </span>
          <span className="user-name">{user.display_name}</span>
        </Link>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          aria-label="Sign out"
          title="Sign out"
          onClick={async () => {
            try {
              await logout.mutateAsync()
              notifySuccess('Signed out')
            } catch {
              // useLogout still clears the local session on failure
              notifyError('Signed out locally; the server session may still be active')
            }
          }}
        >
          <Icon name="LOGOUT" size={18} />
        </button>
      </div>
    </header>
  )
}
