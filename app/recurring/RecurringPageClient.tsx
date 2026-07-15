'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import RecurringForm from './RecurringForm'
import type { RecurringTemplate } from '@/lib/types'

interface Props {
  templates: RecurringTemplate[]
}

export default function RecurringPageClient({ templates }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<RecurringTemplate | undefined>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get('edit')

  useEffect(() => {
    if (editId) {
      const tpl = templates.find((t) => t.id === editId)
      if (tpl) {
        setEditingTemplate(tpl)
        setShowForm(true)
        router.replace('/recurring')
      }
    }
  }, [editId, templates, router])

  function handleClose() {
    setShowForm(false)
    setEditingTemplate(undefined)
  }

  return (
    <>
      {/* FAB */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-20 right-4 z-[90] w-14 h-14 rounded-full btn-base shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={24} className="text-white" />
        </button>
      )}

      {/* Form Drawer */}
      {showForm && <RecurringForm template={editingTemplate} onClose={handleClose} />}
    </>
  )
}
