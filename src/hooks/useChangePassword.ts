import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

type ChangePasswordRequest = components['schemas']['ChangePasswordRequest']

export function useChangePassword() {
  return useMutation({
    mutationFn: async (body: ChangePasswordRequest) => unwrap(await client.POST('/users/me/password', { body })),
  })
}
