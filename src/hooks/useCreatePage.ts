import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { pagesQueryKey } from './usePages'
import type { components } from '../api/OPENAPIClient'

type CreatePageRequest = components['schemas']['CreatePageRequest']

export function useCreatePage(workspaceId: string) {
  return useMutation({
    mutationFn: async (body: CreatePageRequest) =>
      unwrap(await client.POST('/workspaces/{workspaceID}/pages', { params: { path: { workspaceID: workspaceId } }, body })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pagesQueryKey(workspaceId) })
    },
  })
}
