import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

export type Invite = components['schemas']['Invite']

export const invitesQueryKey = (workspaceId: string | undefined) => ['workspaces', workspaceId, 'invites'] as const

export function useWorkspaceInvites(workspaceId: string | undefined) {
  return useQuery({
    queryKey: invitesQueryKey(workspaceId),
    queryFn: async () =>
      unwrap(await client.GET('/workspaces/{workspaceID}/invites', { params: { path: { workspaceID: workspaceId! } } })),
    enabled: Boolean(workspaceId),
  })
}
