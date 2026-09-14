import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

export type Page = components['schemas']['Page']

export function pagesQueryKey(workspaceId: string) {
  return ['workspaces', workspaceId, 'pages'] as const
}

/** Flat list of every page in the workspace — build a tree client-side from parent_id. */
export function usePages(workspaceId: string | undefined) {
  return useQuery({
    queryKey: pagesQueryKey(workspaceId ?? ''),
    queryFn: async () =>
      unwrap(await client.GET('/workspaces/{workspaceID}/pages', { params: { path: { workspaceID: workspaceId! } } })),
    enabled: Boolean(workspaceId),
  })
}
