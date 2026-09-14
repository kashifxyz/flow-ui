import { useState } from 'react'
import { Icon } from '../components/icons/Icon'
import { Modal } from '../components/Modal'
import { CreateWorkspaceForm } from '../components/CreateWorkspaceForm'
import { useWorkspaceContext } from '../context/workspace-context'

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspaceId } = useWorkspaceContext()
  const [creating, setCreating] = useState(false)

  if (!activeWorkspace) {
    return null
  }

  const initial = activeWorkspace.name.trim().charAt(0).toUpperCase() || 'W'

  return (
    <div className="workspace-switcher-row">
      {workspaces.length <= 1 ? (
        <div className="workspace-switcher workspace-switcher-static">
          <span className="workspace-avatar">{initial}</span>
          <span className="workspace-name">{activeWorkspace.name}</span>
        </div>
      ) : (
        <div className="workspace-switcher">
          <span className="workspace-avatar">{initial}</span>
          <select
            className="workspace-select"
            value={activeWorkspace.id}
            onChange={(e) => setActiveWorkspaceId(e.target.value)}
            aria-label="Switch workspace"
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          <Icon name="CHEVRON_DOWN" size={14} className="workspace-chevron" />
        </div>
      )}
      <button
        type="button"
        className="workspace-switcher-add"
        aria-label="New workspace"
        title="New workspace"
        onClick={() => setCreating(true)}
      >
        <Icon name="PLUS" size={13} />
      </button>

      {creating ? (
        <Modal title="Create workspace" onClose={() => setCreating(false)}>
          <CreateWorkspaceForm onCreated={() => setCreating(false)} />
        </Modal>
      ) : null}
    </div>
  )
}
