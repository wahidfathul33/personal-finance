'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyPin } from '@/actions/auth'
import { motion } from 'framer-motion'
import { Moon, Sun, Fingerprint, Wallet, Check } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { PinPad } from '@/components/ui/pinpad'

const PIN_LENGTH = Number(process.env.NEXT_PUBLIC_PIN_LENGTH ?? 6)

// Get current time based greeting
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

export default function AuthPage() {
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handlePinComplete = async (pin: string) => {
    setLoading(true)
    setError('')
    const result = await verifyPin(pin)
    if ('error' in result) {
      setError(result.error)
      setShake(true)
      setTimeout(() => setShake(false), 400)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const isLight = theme === 'light'

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-8 relative">
      {/* Theme Toggle */}
      <motion.button
        onClick={toggle}
        className="absolute top-4 right-4 p-3 rounded-xl bg-base-100 dark:bg-base-800 text-base-600 dark:text-base-300 hover:bg-base-200 dark:hover:bg-base-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        {isLight ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        {/* Logo & Branding */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-base-500 to-base-700 flex items-center justify-center shadow-lg">
                <span className="text-4xl"><Wallet size={40} /></span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md">
                <span className="text-lg"><Check size={18} /></span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Keuangan Kita
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {getGreeting()}
          </p>
        </motion.div>

        {/* PIN Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`w-full ${shake ? 'shake' : ''}`}
        >
          <PinPad
            pinLength={PIN_LENGTH}
            onPinComplete={handlePinComplete}
            className="w-full"
          />

          {/* Error Message */}
          <div className="h-8 mt-4">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-rose-500 dark:text-rose-400 font-medium"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-4"
            >
              <div className="w-6 h-6 border-2 border-base-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </motion.div>

        {/* Biometric Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2"
        >
          <Fingerprint className="w-4 h-4" />
          <span>Masukkan PIN untuk melanjutkan</span>
        </motion.p>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-xs text-gray-400 dark:text-gray-500 text-center"
        >
          <p>Keuangan Kita v2.0</p>
        </motion.footer>
      </motion.div>
    </div>
  )
}

