import { useMemo, useState, type ReactNode } from 'react'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { WorkspaceContext } from './workspace-context'

const STORAGE_KEY = 'flow.activeWorkspaceId'

function readStoredId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // localStorage can throw in private browsing / storage-restricted contexts;
    // the active workspace just won't be remembered across reloads.
  }
}

/**
 * Resolves which workspace is "active" for the whole /app tree: the last one
 * the user had open (persisted client-side, per PROJECT-INFO.md §35 — this
 * is UI state, not server state), falling back to the first workspace the
 * API returns. Server data (the workspace list) is the source of truth;
 * localStorage only remembers a preference. The fallback is derived at
 * render time rather than written back with an effect, so an unavailable
 * stored id never triggers an extra render cycle.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useWorkspaces()
  const workspaces = useMemo(() => data ?? [], [data])
  const [selectedId, setSelectedId] = useState<string | null>(() => readStoredId())

  const resolvedId =
    selectedId && workspaces.some((w) => w.id === selectedId) ? selectedId : (workspaces[0]?.id ?? null)

  const setActiveWorkspaceId = (id: string) => {
    setSelectedId(id)
    writeStoredId(id)
  }

  const activeWorkspace = workspaces.find((w) => w.id === resolvedId) ?? null

  return (
    <WorkspaceContext.Provider value={{ workspaces, isLoading, activeWorkspace, setActiveWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  )
}
