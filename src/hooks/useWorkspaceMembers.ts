import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

export type Member = components['schemas']['Member']

export const membersQueryKey = (workspaceId: string | undefined) => ['workspaces', workspaceId, 'members'] as const

export function useWorkspaceMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: membersQueryKey(workspaceId),
    queryFn: async () =>
      unwrap(await client.GET('/workspaces/{workspaceID}/members', { params: { path: { workspaceID: workspaceId! } } })),
    enabled: Boolean(workspaceId),
  })
}
