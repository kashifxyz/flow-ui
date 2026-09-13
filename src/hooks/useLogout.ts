import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { currentUserQueryKey } from './useCurrentUser'

export function useLogout() {
  return useMutation({
    mutationFn: async () => unwrap(await client.POST('/auth/logout')),
    // Clear the local session even if the request itself failed — the user
    // still wants to be signed out client-side.
    onSettled: () => {
      queryClient.setQueryData(currentUserQueryKey, null)
    },
  })
}
