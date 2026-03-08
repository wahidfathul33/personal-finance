import { getRecurringTemplates } from '@/actions/recurring'
import RecurringForm from '../../RecurringForm'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditRecurringPage({ params }: Props) {
  const { id } = await params
  const templates = await getRecurringTemplates()
  const template = templates.find((t) => t.id === id)

  if (!template) notFound()

  return <RecurringForm template={template} />
}
