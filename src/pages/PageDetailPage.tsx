import { useNavigate, useParams } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { JSONContent } from '@tiptap/react'
import { Icon } from '../components/icons/Icon'
import { PageEditor } from '../components/editor/PageEditor'
import { PageIconPicker } from '../components/PageIconPicker'
import { useWorkspaceContext } from '../context/workspace-context'
import { useDeletePage } from '../hooks/useDeletePage'
import { usePage } from '../hooks/usePage'
import { useUpdatePage } from '../hooks/useUpdatePage'
import { usePageTitle } from '../layout/page-title-context'
import { ApiError } from '../api/error'
import { notifyError, notifySuccess } from '../lib/toast'

const AUTOSAVE_DELAY_MS = 800

/** The page body is stored as a Tiptap JSON document in `props.body` (DEPENDENCIES.md §33). */
function bodyFromPage(page: { props: { [key: string]: unknown }; description: string }): JSONContent | string | undefined {
  const body = page.props.body
  if (body && typeof body === 'object') {
    return body as JSONContent
  }
  // Legacy pages saved before the rich editor existed only have plain-text `description`.
  return page.description || undefined
}

export function PageDetailPage() {
  const { pageId } = useParams({ from: '/app/pages/$pageId' })
  const { activeWorkspace } = useWorkspaceContext()
  const workspaceId = activeWorkspace?.id ?? ''
  const page = usePage(pageId)
  const updatePage = useUpdatePage(pageId, workspaceId)
  const deletePage = useDeletePage(workspaceId)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const pendingBody = useRef<JSONContent | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Local edit buffers track the server copy for whichever page is loaded. Adjusting
  // state during render (rather than in an effect) avoids an extra render pass and a
  // flash of stale content when navigating between pages — see react.dev's guidance
  // on adjusting state when a prop changes.
  const [loadedPageId, setLoadedPageId] = useState<string | null>(null)
  if (page.data && page.data.id !== loadedPageId) {
    setLoadedPageId(page.data.id)
    setTitle(page.data.title)
  }

  // TanStack Router reuses this component instance across sibling /pages/$pageId
  // routes (no unmount), so a pending autosave from the previous page must be
  // discarded — not flushed — when navigating away, or it would land on the
  // wrong page. Keyed on the route param so the cleanup fires exactly on that
  // transition, and again on real unmount.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      pendingBody.current = null
    }
  }, [pageId])

  const initialBody = useMemo(() => (page.data ? bodyFromPage(page.data) : undefined), [page.data])

  const flushBody = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
    if (pendingBody.current) {
      updatePage.mutate({ props: { ...page.data?.props, body: pendingBody.current } })
      pendingBody.current = null
    }
  }

  usePageTitle(page.data?.title || 'Untitled')

  if (page.isLoading) {
    return (
      <div className="app-canvas">
        <div className="app-loading" aria-hidden="true">
          <span className="spinner" />
        </div>
      </div>
    )
  }
  if (!page.data) {
    return (
      <div className="app-canvas">
        <div className="app-empty-card">
          <span className="empty-icon">
            <Icon name="ALERT" size={22} />
          </span>
          <h2>Page not found</h2>
          <p>It may have been deleted, or you may not have access to it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-scroll">
      <div className="page-detail">
        <div className="page-detail-meta">
          <span className="page-kicker">
            <Icon name="PAGE" size={15} />
            Page
          </span>
          {confirmingDelete ? (
            <div className="page-delete-confirm">
              <span>Delete this page?</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={deletePage.isPending}
                onClick={async () => {
                  try {
                    await deletePage.mutateAsync(pageId)
                    notifySuccess('Page deleted')
                    await navigate({ to: '/app' })
                  } catch (err) {
                    notifyError(err instanceof ApiError ? err.message : 'Could not delete page')
                    setConfirmingDelete(false)
                  }
                }}
              >
                <Icon name="TRASH" size={14} />
                Delete
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-ghost btn-sm page-delete-trigger"
              onClick={() => setConfirmingDelete(true)}
            >
              <Icon name="TRASH" size={14} />
              Delete
            </button>
          )}
        </div>

        <PageIconPicker icon={page.data.icon} onSelect={(emoji) => updatePage.mutate({ icon: emoji })} />

        <input
          className="page-title-input"
          value={title}
          placeholder="Untitled"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title !== page.data?.title) {
              updatePage.mutate({ title })
            }
          }}
        />

        <PageEditor
          content={initialBody}
          onChange={(json) => {
            pendingBody.current = json
            if (saveTimer.current) clearTimeout(saveTimer.current)
            saveTimer.current = setTimeout(flushBody, AUTOSAVE_DELAY_MS)
          }}
          onBlur={flushBody}
        />
      </div>
    </div>
  )
}
