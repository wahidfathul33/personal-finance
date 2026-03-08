import { getRecurringTemplates } from '@/actions/recurring'
import PageHeader from '@/components/PageHeader'
import RecurringList from './RecurringList'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RecurringPage() {
  let templates: Awaited<ReturnType<typeof getRecurringTemplates>> = []
  try {
    templates = await getRecurringTemplates()
  } catch {}

  return (
    <div>
      <PageHeader
        title="Berulang"
        subtitle="Template transaksi bulanan"
        right={
          <div className="flex items-center gap-2">
            <Link
              href="/transactions"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Kembali ke Transaksi"
            >
              <ArrowLeft size={16} />
            </Link>
            <Link
              href="/recurring/new"
              className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center"
            >
              <Plus size={18} className="text-white" />
            </Link>
          </div>
        }
      />
      <RecurringList templates={templates} />
    </div>
  )
}
