import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

export type Space = components['schemas']['Space']

export function spacesQueryKey(workspaceId: string) {
  return ['workspaces', workspaceId, 'spaces'] as const
}

export function useSpaces(workspaceId: string | undefined) {
  return useQuery({
    queryKey: spacesQueryKey(workspaceId ?? ''),
    queryFn: async () =>
      unwrap(await client.GET('/workspaces/{workspaceID}/spaces', { params: { path: { workspaceID: workspaceId! } } })),
    enabled: Boolean(workspaceId),
  })
}
