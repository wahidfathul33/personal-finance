import React from 'react'

interface Props {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export default function PageHeader({ title, subtitle, right }: Props) {
  return (
    <div 
      className="flex items-center justify-between px-4 pb-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-[60]" 
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  )
}
