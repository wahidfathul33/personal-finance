import PageHeader from '@/components/PageHeader'

export default function SavingsLoading() {
  return (
    <div className="flex flex-col h-[calc(100dvh-80px)]">
      <PageHeader title="Tabungan" subtitle="Rekap tabungan bersama" />

      {/* Person Summary Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3 ps-4 pe-4 mb-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
            <div className="h-2.5 w-12 rounded-full bg-gray-200 dark:bg-gray-700 mb-2 shimmer-dark" />
            <div className="h-5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
          </div>
        ))}
      </div>

      {/* Total Card Skeleton */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 ms-4 me-4 mb-3">
        <div className="h-2.5 w-10 rounded-full bg-emerald-200 dark:bg-emerald-800 mb-2 shimmer-dark" />
        <div className="h-5 w-28 rounded-full bg-emerald-200 dark:bg-emerald-800 shimmer-dark" />
      </div>

      {/* List Skeleton */}
      <div className="flex-1 min-h-0 overflow-hidden px-4">
        {/* Filter row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 shimmer-dark" />
          <div className="w-28 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 shimmer-dark" />
        </div>
        {/* Month total */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 flex items-center justify-between mb-3">
          <div className="h-2.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
          <div className="h-3.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
        </div>
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
