import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => unwrap(await client.POST('/auth/verify-email', { body: { token } })),
  })
}
