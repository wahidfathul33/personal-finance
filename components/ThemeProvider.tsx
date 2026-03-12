'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

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

  // Home uses its own accent-based theme color via HomeThemeColor.
  if (window.location.pathname === '/') return

  meta.content = THEME_BG[theme]
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const pathname = usePathname()

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

  useEffect(() => {
    // Keep theme-color correct on route changes (especially leaving home).
    syncThemeColor(theme)
  }, [pathname, theme])

  useEffect(() => {
    function themeFromSetting(): Theme {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored === 'light' || stored === 'dark') return stored
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    function onDocumentClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return

      const url = new URL(anchor.href, window.location.origin)
      if (url.origin !== window.location.origin) return

      // Before navigating away from home, force neutral theme-color
      // so the top loading line doesn't keep the home accent color.
      if (url.pathname !== '/') {
        syncThemeColor(themeFromSetting())
      }
    }

    document.addEventListener('click', onDocumentClick, true)
    return () => {
      document.removeEventListener('click', onDocumentClick, true)
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
