import { useMutation } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'
import { queryClient } from '../lib/query'
import { pagesQueryKey } from './usePages'

export function useDeletePage(workspaceId: string) {
  return useMutation({
    mutationFn: async (pageId: string) => unwrap(await client.DELETE('/pages/{pageID}', { params: { path: { pageID: pageId } } })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pagesQueryKey(workspaceId) })
    },
  })
}
