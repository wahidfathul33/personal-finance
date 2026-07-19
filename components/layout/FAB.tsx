'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ArrowDown, ArrowUp, ArrowLeftRight, Repeat } from 'lucide-react'

interface FABProps {
  onAction: (action: 'income' | 'expense' | 'transfer' | 'split') => void
  hidden?: boolean
}

const ACTIONS = [
  { id: 'expense', label: 'Keluar', icon: ArrowDown, color: 'bg-rose-500' },
  { id: 'income', label: 'Masuk', icon: ArrowUp, color: 'bg-emerald-500' },
  { id: 'split', label: 'Split', icon: ArrowLeftRight, color: 'bg-blue-500' },
  { id: 'transfer', label: 'Transfer', icon: Repeat, color: 'bg-violet-500' },
] as const

export default function FAB({ onAction, hidden }: FABProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleFAB = () => {
    setIsOpen(!isOpen)
  }

  const handleAction = (action: 'income' | 'expense' | 'transfer' | 'split') => {
    onAction(action)
    setIsOpen(false)
  }

  if (hidden) return null

  return (
    <div
      className="fixed right-4 z-[60]"
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Main FAB Button */}
        <motion.button
          onClick={toggleFAB}
          className="w-14 h-14 rounded-full bg-base-gradient text-white shadow-lg flex items-center justify-center hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-base-500 focus:ring-offset-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: 0, scale: 0 }}
                animate={{ rotate: 45, scale: 1 }}
                exit={{ rotate: 90, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: -90, scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Action Buttons */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-full right-0 mb-2 flex flex-col gap-2"
            >
              {ACTIONS.map((action, index) => (
                <motion.button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-base-200 dark:border-base-700 hover:shadow-xl transition-shadow"
                >
                  <div className={`p-1.5 rounded-full ${action.color}`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
