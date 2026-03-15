'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface HideAmountsContextType {
  hidden: boolean
  toggle: () => void
}

const HideAmountsContext = createContext<HideAmountsContextType>({
  hidden: false,
  toggle: () => {},
})

export function HideAmountsProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('hideAmounts')
    if (stored === 'true') setHidden(true)
  }, [])

  function toggle() {
    setHidden((prev) => {
      const next = !prev
      localStorage.setItem('hideAmounts', String(next))
      return next
    })
  }

  return (
    <HideAmountsContext.Provider value={{ hidden, toggle }}>
      {children}
    </HideAmountsContext.Provider>
  )
}

export function useHideAmounts() {
  return useContext(HideAmountsContext)
}
