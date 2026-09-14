import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { workspacesQueryKey } from './useWorkspaces'
import type { components } from '../api/OPENAPIClient'

type CreateWorkspaceRequest = components['schemas']['CreateWorkspaceRequest']

export function useCreateWorkspace() {
  return useMutation({
    mutationFn: async (body: CreateWorkspaceRequest) => unwrap(await client.POST('/workspaces', { body })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey })
    },
  })
}
