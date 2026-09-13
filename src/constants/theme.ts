export const THEMES = ['light', 'dark', 'amoled'] as const

export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'light'
