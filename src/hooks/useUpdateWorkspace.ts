import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { workspacesQueryKey } from './useWorkspaces'
import type { components } from '../api/OPENAPIClient'

type UpdateWorkspaceRequest = components['schemas']['UpdateWorkspaceRequest']

export function useUpdateWorkspace(workspaceId: string) {
  return useMutation({
    mutationFn: async (body: UpdateWorkspaceRequest) =>
      unwrap(await client.PATCH('/workspaces/{workspaceID}', { params: { path: { workspaceID: workspaceId } }, body })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey })
    },
  })
}
