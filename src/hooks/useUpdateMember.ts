import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { membersQueryKey } from './useWorkspaceMembers'
import type { components } from '../api/OPENAPIClient'

type UpdateMemberRequest = components['schemas']['UpdateMemberRequest']

export function useUpdateMember(workspaceId: string) {
  return useMutation({
    mutationFn: async ({ userId, body }: { userId: string; body: UpdateMemberRequest }) =>
      unwrap(
        await client.PATCH('/workspaces/{workspaceID}/members/{userID}', {
          params: { path: { workspaceID: workspaceId, userID: userId } },
          body,
        }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: membersQueryKey(workspaceId) })
    },
  })
}
