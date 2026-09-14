import { createContext, useContext } from 'react'
import type { Workspace } from '../hooks/useWorkspaces'

export type WorkspaceContextValue = {
  workspaces: Workspace[]
  isLoading: boolean
  activeWorkspace: Workspace | null
  setActiveWorkspaceId: (id: string) => void
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspaceContext(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider')
  }
  return ctx
}
