import { useQuery } from '@tanstack/react-query'
import { ApiError, fetchMe } from '../lib/api'

export const meQueryKey = ['auth', 'me'] as const

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async () => {
      try {
        return await fetchMe()
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          return null
        }
        throw err
      }
    },
  })
}
