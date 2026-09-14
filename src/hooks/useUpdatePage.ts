import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { pageQueryKey } from './usePage'
import { pagesQueryKey } from './usePages'
import type { components } from '../api/OPENAPIClient'

type UpdatePageRequest = components['schemas']['UpdatePageRequest']

export function useUpdatePage(pageId: string, workspaceId: string) {
  return useMutation({
    mutationFn: async (body: UpdatePageRequest) =>
      unwrap(await client.PATCH('/pages/{pageID}', { params: { path: { pageID: pageId } }, body })),
    onSuccess: (page) => {
      queryClient.setQueryData(pageQueryKey(pageId), page)
      void queryClient.invalidateQueries({ queryKey: pagesQueryKey(workspaceId) })
    },
  })
}
