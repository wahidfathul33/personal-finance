'use client'

import { useState } from 'react'
import FAB from '@/components/layout/FAB'
import TransactionForm from '@/components/transaction/TransactionForm'

interface FABWrapperProps {
  onSuccess?: () => void
}

export default function FABWrapper({ onSuccess }: FABWrapperProps = {}) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'income' | 'expense' | 'transfer' | 'split'>('expense')

  const handleAction = (action: 'income' | 'expense' | 'transfer' | 'split') => {
    setFormMode(action)
    setIsFormOpen(true)
  }

  const handleClose = () => {
    setIsFormOpen(false)
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    onSuccess?.()
  }

  return (
    <>
      <FAB onAction={handleAction} hidden={isFormOpen} />
      {isFormOpen && (
        <TransactionForm
          defaultMode={formMode}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
