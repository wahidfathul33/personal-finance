'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'

type ToastType = 'default' | 'error'
interface ToastItem { id: number; message: string; type: ToastType }

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType) => void
}>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'default') => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-50 px-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-2.5 rounded-full text-sm font-medium shadow-lg animate-fade-in-up ${
              t.type === 'error'
                ? 'bg-rose-600/80 text-white'
                : 'bg-gray-900/75 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
