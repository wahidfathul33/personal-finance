'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { verifyPin } from '@/actions/auth'
import { Delete } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const PIN_LENGTH = Number(process.env.NEXT_PUBLIC_PIN_LENGTH ?? 6)

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

export default function AuthPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const dotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pin.length === PIN_LENGTH && !loading) {
      submit(pin)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  async function submit(value: string) {
    setLoading(true)
    setError('')
    const result = await verifyPin(value)
    if ('error' in result) {
      setError(result.error)
      setPin('')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  function handleKey(digit: string) {
    if (loading || pin.length >= PIN_LENGTH) return
    setPin((prev) => prev + digit)
    setError('')
  }

  function handleDelete() {
    if (loading) return
    setPin((prev) => prev.slice(0, -1))
    setError('')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-8">
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xs flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Keuangan Kita</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Masukkan PIN</p>
        </div>

        {/* PIN dots */}
        <div ref={dotsRef} className={`flex justify-center gap-4 mb-3 ${shake ? 'shake' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                i < pin.length
                  ? 'bg-indigo-600 scale-110'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        <div className="h-5 mb-6">
          {error && (
            <p className="text-center text-xs text-rose-500 animate-fade-in-up">{error}</p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {KEYS.map((key, i) => {
            if (key === '') return <div key={i} />

            if (key === 'del') {
              return (
                <button
                  key={i}
                  onClick={handleDelete}
                  disabled={loading || pin.length === 0}
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-30"
                >
                  <Delete size={26} />
                </button>
              )
            }

            return (
              <button
                key={i}
                onClick={() => handleKey(key)}
                disabled={loading}
                className="w-20 h-20 rounded-full mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-2xl font-semibold text-gray-800 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              >
                {key}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
