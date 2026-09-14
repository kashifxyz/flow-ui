import { Link, useNavigate } from '@tanstack/react-router'
import { Icon } from '../components/icons/Icon'
import { Wordmark } from '../components/Wordmark'
import { useWorkspaceContext } from '../context/workspace-context'
import { useCreatePage } from '../hooks/useCreatePage'
import { usePages } from '../hooks/usePages'
import { notifyError } from '../lib/toast'
import { ApiError } from '../api/error'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { activeWorkspace } = useWorkspaceContext()
  const pages = usePages(activeWorkspace?.id)
  const createPage = useCreatePage(activeWorkspace?.id ?? '')
  const navigate = useNavigate()

  const topLevelPages = (pages.data ?? []).filter((page) => !page.parent_id)

  return (
    <aside className="app-rail">
      <div className="app-rail-top">
        <Wordmark to="/app" />
      </div>

      <WorkspaceSwitcher />

      <nav className="app-rail-nav">
        <Link
          to="/app"
          className="app-space"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'app-space active' }}
          onClick={onNavigate}
        >
          <Icon name="HOME" size={18} />
          Home
        </Link>

        <div className="app-rail-section">
          <span>Pages</span>
          <button
            type="button"
            className="app-rail-add"
            aria-label="New page"
            title="New page"
            disabled={!activeWorkspace || createPage.isPending}
            onClick={async () => {
              if (!activeWorkspace) {
                return
              }
              try {
                const page = await createPage.mutateAsync({ title: 'Untitled' })
                onNavigate?.()
                await navigate({ to: '/app/pages/$pageId', params: { pageId: page.id } })
              } catch (err) {
                notifyError(err instanceof ApiError ? err.message : 'Could not create page')
              }
            }}
          >
            <Icon name="PLUS" size={14} />
          </button>
        </div>

        <div className="app-page-list">
          {topLevelPages.map((page) => (
            <Link
              key={page.id}
              to="/app/pages/$pageId"
              params={{ pageId: page.id }}
              className="app-space"
              activeProps={{ className: 'app-space active' }}
              onClick={onNavigate}
            >
              {page.icon ? (
                <span className="app-space-emoji" aria-hidden="true">
                  {page.icon}
                </span>
              ) : (
                <Icon name="PAGE" size={16} />
              )}
              <span className="app-space-label">{page.title || 'Untitled'}</span>
            </Link>
          ))}
          {pages.data && topLevelPages.length === 0 ? (
            <p className="app-rail-empty">No pages yet — use the + above to create one.</p>
          ) : null}
        </div>
      </nav>

      <div className="app-rail-footer">
        <Link
          to="/app/settings"
          className="app-space"
          activeProps={{ className: 'app-space active' }}
          onClick={onNavigate}
        >
          <Icon name="SETTINGS" size={16} />
          Settings & members
        </Link>
      </div>
    </aside>
  )
}
