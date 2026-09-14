import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import type { components } from '../api/OPENAPIClient'

export type Workspace = components['schemas']['Workspace']

export const workspacesQueryKey = ['workspaces'] as const

export function useWorkspaces() {
  return useQuery({
    queryKey: workspacesQueryKey,
    queryFn: async () => unwrap(await client.GET('/workspaces')),
  })
}
