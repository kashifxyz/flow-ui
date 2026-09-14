import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { invitesQueryKey } from './useWorkspaceInvites'
import type { components } from '../api/OPENAPIClient'

type CreateInviteRequest = components['schemas']['CreateInviteRequest']

export function useCreateInvite(workspaceId: string) {
  return useMutation({
    mutationFn: async (body: CreateInviteRequest) =>
      unwrap(
        await client.POST('/workspaces/{workspaceID}/invites', {
          params: { path: { workspaceID: workspaceId } },
          body,
        }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invitesQueryKey(workspaceId) })
    },
  })
}
