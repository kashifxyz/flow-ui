import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { workspacesQueryKey } from './useWorkspaces'

export function useAcceptInvite() {
  return useMutation({
    mutationFn: async (token: string) => unwrap(await client.POST('/invites/{token}/accept', { params: { path: { token } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey })
    },
  })
}
