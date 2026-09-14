import { useNavigate } from '@tanstack/react-router'
import { Icon } from '../components/icons/Icon'
import { CreateWorkspaceForm } from '../components/CreateWorkspaceForm'
import { useWorkspaceContext } from '../context/workspace-context'
import { useCreatePage } from '../hooks/useCreatePage'
import { usePages } from '../hooks/usePages'
import { usePageTitle } from '../layout/page-title-context'
import { ApiError } from '../api/error'
import { notifyError } from '../lib/toast'

export function WorkspaceHomePage() {
  const { workspaces, isLoading, activeWorkspace } = useWorkspaceContext()
  const pages = usePages(activeWorkspace?.id)
  const createPage = useCreatePage(activeWorkspace?.id ?? '')
  const navigate = useNavigate()
  usePageTitle(activeWorkspace?.name ?? 'Home')

  if (isLoading) {
    return (
      <div className="app-canvas">
        <div className="app-loading" aria-hidden="true">
          <span className="spinner" />
        </div>
      </div>
    )
  }

  if (workspaces.length === 0) {
    return (
      <div className="app-canvas">
        <div className="app-empty-card app-empty-card-wide">
          <span className="empty-icon empty-icon-accent">
            <Icon name="HOME" size={24} />
          </span>
          <h2>Create your workspace</h2>
          <p>Everything in Flow lives inside a workspace — pages, databases, canvases, and the people you invite.</p>
          <CreateWorkspaceForm />
        </div>
      </div>
    )
  }

  const topLevelPages = (pages.data ?? []).filter((page) => !page.parent_id)

  const createFirstPage = async () => {
    if (!activeWorkspace) return
    try {
      const page = await createPage.mutateAsync({ title: 'Untitled' })
      await navigate({ to: '/app/pages/$pageId', params: { pageId: page.id } })
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : 'Could not create page')
    }
  }

  if (!pages.isLoading && topLevelPages.length === 0) {
    return (
      <div className="app-canvas">
        <div className="app-empty-card">
          <span className="empty-icon">
            <Icon name="FOLDER" size={24} />
          </span>
          <h2>Your graph is empty</h2>
          <p>Pages, databases, and canvases will land here as connected nodes. Create the first one to get started.</p>
          <button type="button" className="btn btn-primary btn-sm" disabled={createPage.isPending} onClick={createFirstPage}>
            <Icon name="PLUS" size={14} />
            New page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="home-dashboard">
      <div className="home-dashboard-header">
        <h1>{activeWorkspace?.name}</h1>
        <button type="button" className="btn btn-primary btn-sm" disabled={createPage.isPending} onClick={createFirstPage}>
          <Icon name="PLUS" size={14} />
          New page
        </button>
      </div>
      <h2 className="home-section-label">Pages</h2>
      <div className="home-page-grid">
        {topLevelPages.map((page) => (
          <button
            key={page.id}
            type="button"
            className="home-page-card"
            onClick={() => navigate({ to: '/app/pages/$pageId', params: { pageId: page.id } })}
          >
            <span className="home-page-card-icon">
              {page.icon ? <span aria-hidden="true">{page.icon}</span> : <Icon name="PAGE" size={18} />}
            </span>
            <span className="home-page-card-title">{page.title || 'Untitled'}</span>
            <span className="home-page-card-meta">Edited {new Date(page.updated_at).toLocaleDateString()}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
