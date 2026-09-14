import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { invitesQueryKey } from './useWorkspaceInvites'

export function useRevokeInvite(workspaceId: string) {
  return useMutation({
    mutationFn: async (inviteId: string) =>
      unwrap(
        await client.DELETE('/workspaces/{workspaceID}/invites/{inviteID}', {
          params: { path: { workspaceID: workspaceId, inviteID: inviteId } },
        }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invitesQueryKey(workspaceId) })
    },
  })
}
