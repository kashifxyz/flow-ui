import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { sessionsQueryKey } from './useSessions'

export function useRevokeSession() {
  return useMutation({
    mutationFn: async (sessionId: string) =>
      unwrap(await client.DELETE('/users/me/sessions/{sessionID}', { params: { path: { sessionID: sessionId } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionsQueryKey })
    },
  })
}
