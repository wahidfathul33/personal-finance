'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type BaseColor = 'indigo' | 'violet' | 'rose' | 'emerald' | 'blue' | 'amber' | 'pink' | 'teal'
export const BASE_COLOR_OPTIONS: BaseColor[] = [
  'indigo', 'violet', 'rose', 'emerald', 'blue', 'amber', 'pink', 'teal',
]
const DEFAULT: BaseColor = 'indigo'

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
