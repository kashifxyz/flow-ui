import { Navigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { Icon } from '../components/icons/Icon'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { Wordmark } from '../components/Wordmark'
import { useMe } from '../auth/useMe'
import { logout } from '../lib/api'
import { queryClient } from '../lib/query'
import { meQueryKey } from '../auth/useMe'

export function AppPage() {
  const me = useMe()
  const user = me.data

  if (me.isLoading) {
    return <div className="app-canvas">Loading workspace…</div>
  }
  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="app-shell">
      <aside className="app-rail">
        <div className="app-rail-top">
          <Wordmark to="/app" />
        </div>
        <div className="app-space active">
          <Icon name="HOME" size={18} />
          Home
        </div>
        <div className="app-space">
          <Icon name="PAGE" size={18} />
          Pages
        </div>
        <div className="app-space">
          <Icon name="DATABASE" size={18} />
          Databases
        </div>
        <div className="app-space">
          <Icon name="CANVAS" size={18} />
          Canvas
        </div>
      </aside>
      <div className="app-main">
        <header className="app-bar">
          <h1>Home</h1>
          <div className="app-user">
            <ThemeSwitch />
            <span>
              {user.display_name}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={async () => {
                try {
                  await logout()
                } catch {
                  // still clear local session
                }
                queryClient.setQueryData(meQueryKey, null)
                toast.success('Signed out')
              }}
            >
              <Icon name="LOGOUT" size={18} />
              Sign out
            </button>
          </div>
        </header>
        <div className="app-canvas">
          <div className="app-empty">
            <Icon name="FOLDER" size={28} />
            <h2>Your graph is empty</h2>
            <p>
              Pages, databases, and canvases will land here as connected nodes. The workspace chrome
              is in place; the editor surfaces come next.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
