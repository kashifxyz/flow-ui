import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { membersQueryKey } from './useWorkspaceMembers'

export function useRemoveMember(workspaceId: string) {
  return useMutation({
    mutationFn: async (userId: string) =>
      unwrap(
        await client.DELETE('/workspaces/{workspaceID}/members/{userID}', {
          params: { path: { workspaceID: workspaceId, userID: userId } },
        }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: membersQueryKey(workspaceId) })
    },
  })
}
