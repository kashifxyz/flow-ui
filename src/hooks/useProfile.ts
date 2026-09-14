import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

export type Profile = components['schemas']['Profile']

export const profileQueryKey = ['users', 'me'] as const

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => unwrap(await client.GET('/users/me')),
  })
}
