import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

export type Session = components['schemas']['Session']

export const sessionsQueryKey = ['users', 'me', 'sessions'] as const

export function useSessions() {
  return useQuery({
    queryKey: sessionsQueryKey,
    queryFn: async () => unwrap(await client.GET('/users/me/sessions')),
  })
}
