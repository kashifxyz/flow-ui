import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'

export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => unwrap(await client.POST('/auth/resend-verification', { body: { email } })),
  })
}
