import { createContext, useContext, useEffect } from 'react'

export type PageTitleContextValue = {
  title: string
  setTitle: (title: string) => void
}

export const PageTitleContext = createContext<PageTitleContextValue | null>(null)

/** Call from a routed page to set the topbar's heading — avoids prop-drilling the title through the router outlet. */
export function usePageTitle(title: string) {
  const ctx = useContext(PageTitleContext)
  useEffect(() => {
    ctx?.setTitle(title)
  }, [ctx, title])
}

export function useTopbarTitle(): string {
  const ctx = useContext(PageTitleContext)
  return ctx?.title ?? ''
}
