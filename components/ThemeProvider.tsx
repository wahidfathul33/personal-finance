'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

const THEME_BG: Record<Theme, string> = {
  light: '#ffffff',
  dark:  '#111827',
}

function syncThemeColor(theme: Theme) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = THEME_BG[theme]
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const preferred = stored ?? (systemDark ? 'dark' : 'light')
    setTheme(preferred)
    document.documentElement.classList.toggle('dark', preferred === 'dark')
    // Jangan timpa theme-color di halaman home — HomeThemeColor yang mengatur
    if (window.location.pathname !== '/') {
      syncThemeColor(preferred)
    }
  }, [])

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      syncThemeColor(next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
