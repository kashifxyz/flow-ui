import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { myInvitesQueryKey } from './useMyInvites'
import { workspacesQueryKey } from './useWorkspaces'

export function useAcceptInviteById() {
  return useMutation({
    mutationFn: async ({ workspaceId, inviteId }: { workspaceId: string; inviteId: string }) =>
      unwrap(
        await client.POST('/workspaces/{workspaceID}/invites/{inviteID}/accept', {
          params: { path: { workspaceID: workspaceId, inviteID: inviteId } },
        }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: myInvitesQueryKey })
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey })
    },
  })
}
