'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV === 'development') {
      // Unregister any existing service workers in development
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister()
        }
      })
      return
    }

    // Register service worker in production
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        reg.update()
      })
      .catch(() => {})
  }, [])

  return null
}
