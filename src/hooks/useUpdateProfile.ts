import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { profileQueryKey } from './useProfile'
import { currentUserQueryKey } from './useCurrentUser'
import type { components } from '../api/OPENAPIClient'

type UpdateProfileRequest = components['schemas']['UpdateProfileRequest']

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (body: UpdateProfileRequest) => unwrap(await client.PATCH('/users/me', { body })),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, profile)
      // display_name is also shown via /auth/me (topbar, sidebar) — keep it in sync.
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
    },
  })
}
