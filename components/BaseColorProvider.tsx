'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type BaseColor = 'indigo' | 'violet' | 'rose' | 'emerald' | 'blue' | 'amber' | 'pink' | 'teal'
export const BASE_COLOR_OPTIONS: BaseColor[] = [
  'indigo', 'violet', 'rose', 'emerald', 'blue', 'amber', 'pink', 'teal',
]
const DEFAULT: BaseColor = 'indigo'

const BASE_COLOR_HEX: Record<BaseColor, string> = {
  indigo:  '#4f46e5',
  violet:  '#7c3aed',
  rose:    '#e11d48',
  emerald: '#059669',
  blue:    '#2563eb',
  amber:   '#d97706',
  pink:    '#db2777',
  teal:    '#0d9488',
}

const BaseColorContext = createContext<{
  color: BaseColor
  setColor: (c: BaseColor) => void
}>({ color: DEFAULT, setColor: () => {} })

export function BaseColorProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState<BaseColor>(DEFAULT)

  useEffect(() => {
    const stored = localStorage.getItem('baseColor') as BaseColor | null
    const c = stored && BASE_COLOR_OPTIONS.includes(stored) ? stored : DEFAULT
    apply(c)
    setColorState(c)
  }, [])

  function apply(c: BaseColor) {
    document.documentElement.setAttribute('data-basecolor', c)
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta) {
      meta.content = BASE_COLOR_HEX[c]
    } else {
      const m = document.createElement('meta')
      m.name = 'theme-color'
      m.content = BASE_COLOR_HEX[c]
      document.head.appendChild(m)
    }
  }

  function setColor(c: BaseColor) {
    setColorState(c)
    localStorage.setItem('baseColor', c)
    apply(c)
  }

  return (
    <BaseColorContext.Provider value={{ color, setColor }}>
      {children}
    </BaseColorContext.Provider>
  )
}

export function useBaseColor() {
  return useContext(BaseColorContext)
}
