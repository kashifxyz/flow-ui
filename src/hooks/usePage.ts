import { useQuery } from '@tanstack/react-query'
import { client } from '../api/client'
import { unwrap } from '../api/error'

export function pageQueryKey(pageId: string) {
  return ['pages', pageId] as const
}

export function usePage(pageId: string | undefined) {
  return useQuery({
    queryKey: pageQueryKey(pageId ?? ''),
    queryFn: async () => unwrap(await client.GET('/pages/{pageID}', { params: { path: { pageID: pageId! } } })),
    enabled: Boolean(pageId),
  })
}
