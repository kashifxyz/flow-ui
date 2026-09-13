import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { ApiError, unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

export type CurrentUser = components['schemas']['User']

export const currentUserQueryKey = ['auth', 'me'] as const

/** The signed-in user, or `null` when there is no session. */
export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async (): Promise<CurrentUser | null> => {
      const result = await client.GET('/auth/me')
      try {
        return unwrap(result)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          return null
        }
        throw err
      }
    },
  })
}
