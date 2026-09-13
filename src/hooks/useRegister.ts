import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

type RegisterRequest = components['schemas']['RegisterRequest']

export function useRegister() {
  return useMutation({
    mutationFn: async (body: RegisterRequest) => unwrap(await client.POST('/auth/register', { body })),
  })
}
