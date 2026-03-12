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
    const stored = localStorage.getItem('baseColor') as BaseColor | null
    const color = stored && BASE_COLOR_OPTIONS.includes(stored) ? stored : 'indigo'
    setThemeColor(BASE_COLOR_HEX[color])

    return () => {
      setThemeColor(getThemeBg())
    }
  }, [])

  return null
}
