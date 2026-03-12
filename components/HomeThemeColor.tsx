'use client'

import { useEffect } from 'react'
import { BASE_COLOR_HEX, BASE_COLOR_OPTIONS, type BaseColor } from './BaseColorProvider'

function getThemeBg(): string {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? '#111827' : '#ffffff'
}

function setThemeColor(color: string) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = color
}

export default function HomeThemeColor() {
  useEffect(() => {
    function applyHomeColor() {
      const stored = localStorage.getItem('baseColor') as BaseColor | null
      const color = stored && BASE_COLOR_OPTIONS.includes(stored) ? stored : 'indigo'
      setThemeColor(BASE_COLOR_HEX[color])
    }

    applyHomeColor()

    function onBaseColorChange() {
      applyHomeColor()
    }

    function onStorage(e: StorageEvent) {
      if (e.key === 'baseColor' || e.key === null) applyHomeColor()
    }

    window.addEventListener('basecolorchange', onBaseColorChange)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('basecolorchange', onBaseColorChange)
      window.removeEventListener('storage', onStorage)
      setThemeColor(getThemeBg())
    }
  }, [])

  return null
}
