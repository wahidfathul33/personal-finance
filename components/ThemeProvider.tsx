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

const BASE_COLOR_HEX: Record<string, string> = {
  indigo: '#4f46e5',
  violet: '#7c3aed',
  rose: '#e11d48',
  emerald: '#059669',
  blue: '#2563eb',
  amber: '#d97706',
  pink: '#db2777',
  teal: '#0d9488',
}

function syncThemeColor(theme: Theme) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  if (window.location.pathname === '/') {
    const base = localStorage.getItem('baseColor') ?? 'indigo'
    meta.content = BASE_COLOR_HEX[base] ?? BASE_COLOR_HEX.indigo
    return
  }

  meta.content = THEME_BG[theme]
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function apply(themeValue: Theme) {
      setTheme(themeValue)
      document.documentElement.classList.toggle('dark', themeValue === 'dark')
      syncThemeColor(themeValue)
    }

    function computePreferred(): Theme {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored === 'light' || stored === 'dark') return stored
      return media.matches ? 'dark' : 'light'
    }

    apply(computePreferred())

    function onMediaChange() {
      const stored = localStorage.getItem('theme') as Theme | null
      if (!stored) apply(media.matches ? 'dark' : 'light')
    }

    function onStorage(e: StorageEvent) {
      if (e.key === 'theme' || e.key === null) {
        apply(computePreferred())
      }
    }

    media.addEventListener('change', onMediaChange)
    window.addEventListener('storage', onStorage)
    return () => {
      media.removeEventListener('change', onMediaChange)
      window.removeEventListener('storage', onStorage)
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
