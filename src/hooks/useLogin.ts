import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { currentUserQueryKey } from './useCurrentUser'
import type { components } from '../api/OPENAPIClient'

type LoginRequest = components['schemas']['LoginRequest']

export function useLogin() {
  return useMutation({
    mutationFn: async (body: LoginRequest) => unwrap(await client.POST('/auth/login', { body })),
    onSuccess: (user) => {
      queryClient.setQueryData(currentUserQueryKey, user)
    },
  })
}
