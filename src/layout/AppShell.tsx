import { Navigate, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { WorkspaceProvider } from '../context/WorkspaceContext'
import { PageTitleProvider } from './PageTitleContext'
import { PendingInvitesBanner } from './PendingInvitesBanner'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const me = useCurrentUser()
  const [navOpen, setNavOpen] = useState(false)

  if (me.isLoading) {
    return (
      <div className="app-canvas">
        <div className="app-loading" aria-hidden="true">
          <span className="spinner" />
        </div>
      </div>
    )
  }
  if (me.isError) {
    return (
      <div className="app-canvas">
        <div className="app-empty-card">
          <h2>Couldn't load your session</h2>
          <p>Something went wrong reaching the server. Check your connection and try again.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => void me.refetch()}>
            Retry
          </button>
        </div>
      </div>
    )
  }
  if (!me.data) {
    return <Navigate to="/login" />
  }

  return (
    <WorkspaceProvider>
      <PageTitleProvider>
        <div className={navOpen ? 'app-shell nav-open' : 'app-shell'}>
          <Sidebar onNavigate={() => setNavOpen(false)} />
          <button
            type="button"
            className="app-shell-scrim"
            aria-hidden={!navOpen}
            tabIndex={-1}
            onClick={() => setNavOpen(false)}
          />
          <div className="app-main">
            <Topbar user={me.data} onMenuClick={() => setNavOpen((open) => !open)} />
            <PendingInvitesBanner />
            <Outlet />
          </div>
        </div>
      </PageTitleProvider>
    </WorkspaceProvider>
  )
}
