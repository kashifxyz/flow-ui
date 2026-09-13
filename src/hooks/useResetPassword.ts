import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'

export function useResetPassword() {
  return useMutation({
    mutationFn: async (body: { token: string; password: string }) =>
      unwrap(await client.POST('/auth/reset-password', { body })),
  })
}
