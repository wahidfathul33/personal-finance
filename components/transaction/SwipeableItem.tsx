'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeableItemProps {
  children: React.ReactNode
  onDelete?: () => void
  onDuplicate?: () => void
  onEdit?: () => void
  className?: string
}

export default function SwipeableItem({
  children,
  onDelete,
  onDuplicate,
  onEdit,
  className,
}: SwipeableItemProps) {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const threshold = 60

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    startX.current = e.clientX
    startOffset.current = offset
    setIsDragging(true)
    containerRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startX.current
    let newOffset = startOffset.current + deltaX

    // Limit swipe distance
    newOffset = Math.max(Math.min(newOffset, 0), -120)
    setOffset(newOffset)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    if (offset < -threshold) {
      // Snap to fully open
      setOffset(-120)
    } else if (offset > -threshold && offset < 0) {
      // Snap back to closed
      setOffset(0)
    }
  }

  const handleClose = () => {
    setOffset(0)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      data-swipe-ignore
      className={cn('relative overflow-hidden rounded-xl', className)}
    >
      {/* Action Buttons (behind) */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        {onEdit && (
          <motion.button
            onClick={onEdit}
            className="h-full px-4 bg-base-500 text-white flex items-center justify-center"
            initial={{ x: 120 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Pencil size={16} />
          </motion.button>
        )}
        {onDuplicate && (
          <motion.button
            onClick={onDuplicate}
            className="h-full px-4 bg-blue-500 text-white flex items-center justify-center"
            initial={{ x: 120 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Copy size={16} />
          </motion.button>
        )}
        {onDelete && (
          <motion.button
            onClick={onDelete}
            className="h-full px-4 bg-rose-500 text-white flex items-center justify-center"
            initial={{ x: 120 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Trash2 size={16} />
          </motion.button>
        )}
      </div>

      {/* Main Content (slides) */}
      <motion.div
        className="bg-white dark:bg-gray-800"
        style={{ x: offset }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        animate={{ x: offset }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
