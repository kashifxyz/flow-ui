import { useForm } from '@tanstack/react-form'
import { useWorkspaceContext } from '../context/workspace-context'
import { useCreateWorkspace } from '../hooks/useCreateWorkspace'
import { ApiError } from '../api/error'
import { notifyError, notifySuccess } from '../lib/toast'
import { preventSubmit } from '../lib/form'
import { validateRequired } from '../lib/validation'

export function CreateWorkspaceForm({ onCreated }: { onCreated?: () => void }) {
  const createWorkspace = useCreateWorkspace()
  const { setActiveWorkspaceId } = useWorkspaceContext()

  const form = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value }) => {
      try {
        const workspace = await createWorkspace.mutateAsync({ name: value.name })
        setActiveWorkspaceId(workspace.id)
        notifySuccess('Workspace created')
        onCreated?.()
      } catch (err) {
        notifyError(err instanceof ApiError ? err.message : 'Could not create workspace')
      }
    },
  })

  return (
    <form className="workspace-create-form" onSubmit={preventSubmit(() => void form.handleSubmit())}>
      <form.Field name="name" validators={{ onChange: ({ value }) => validateRequired('Workspace name')(value) }}>
        {(field) => (
          <div className="workspace-create-field">
            <input
              className="workspace-create-input"
              placeholder="Acme Inc"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              autoFocus
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
              <span className="field-error">{field.state.meta.errors.join(', ')}</span>
            ) : null}
          </div>
        )}
      </form.Field>
      <button className="btn btn-primary" type="submit" disabled={createWorkspace.isPending}>
        {createWorkspace.isPending ? 'Creating…' : 'Create workspace'}
      </button>
    </form>
  )
}
