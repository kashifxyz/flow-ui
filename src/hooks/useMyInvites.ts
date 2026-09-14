import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

export type MyInvite = components['schemas']['MyInvite']

export const myInvitesQueryKey = ['invites', 'mine'] as const

/** Pending invites addressed to the current user's email — surfaced in-app so
 * accepting doesn't depend on the invitee having received or clicked an email. */
export function useMyInvites() {
  return useQuery({
    queryKey: myInvitesQueryKey,
    queryFn: async () => unwrap(await client.GET('/invites/mine')),
    staleTime: 30_000,
  })
}
