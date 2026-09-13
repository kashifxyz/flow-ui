import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_THEME, THEMES, type Theme } from '../constants/theme'
import { ThemeContext } from './context'

const STORAGE_KEY = 'flow-theme'

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (THEMES as readonly string[]).includes(stored)) {
      return stored as Theme
    }
  } catch {
    // ignore
  }
  return DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      cycleTheme: () => {
        const i = THEMES.indexOf(theme)
        setTheme(THEMES[(i + 1) % THEMES.length])
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
