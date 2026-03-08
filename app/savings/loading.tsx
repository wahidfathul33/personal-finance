import PageHeader from '@/components/PageHeader'

export default function SavingsLoading() {
  return (
    <div className="flex flex-col h-[calc(100dvh-80px)]">
      <PageHeader title="Tabungan" subtitle="Rekap tabungan bersama" />

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 text-center">
            <div className="h-2.5 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-2 shimmer-dark" />
            <div className="h-4 w-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto shimmer-dark" />
          </div>
        ))}
      </div>

      {/* List Skeleton */}
      <div className="flex-1 min-h-0 overflow-hidden px-4">
        {/* Filter row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 shimmer-dark" />
          <div className="w-28 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 shimmer-dark" />
        </div>
        {/* Month total */}
        <div className="h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-3 shimmer-dark" />
        {/* Header row */}
        <div className="flex justify-between items-center mb-3">
          <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
        </div>
        {/* Items */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 shimmer-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
                <div className="h-2.5 w-20 rounded-full bg-gray-100 dark:bg-gray-700/60 shimmer-dark" />
              </div>
              <div className="h-4 w-16 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
