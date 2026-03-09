import PageHeader from '@/components/PageHeader'

export default function AssetsLoading() {
  return (
    <div>
      <PageHeader title="Aset" subtitle="Emas & Kekayaan" />
      <div className="px-4 space-y-4 pb-8">
        {/* Gold summary card skeleton */}
        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-4 relative">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 shimmer" />
          <div className="h-3 w-28 rounded-full bg-white/30 mb-2 shimmer" />
          <div className="h-8 w-40 rounded-full bg-white/30 mb-3 shimmer" />
          <div className="flex justify-between">
            <div>
              <div className="h-2.5 w-16 rounded-full bg-white/30 mb-1.5 shimmer" />
              <div className="h-4 w-20 rounded-full bg-white/30 shimmer" />
            </div>
            <div className="text-right">
              <div className="h-2.5 w-16 rounded-full bg-white/30 mb-1.5 ml-auto shimmer" />
              <div className="h-4 w-24 rounded-full bg-white/30 shimmer" />
            </div>
          </div>
        </div>

        {/* Deposit summary card skeleton */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4">
          <div className="h-3 w-24 rounded-full bg-white/30 mb-2 shimmer" />
          <div className="h-8 w-36 rounded-full bg-white/30 shimmer" />
        </div>

        {/* Kepemilikan Emas skeleton */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex-shrink-0 shimmer-dark" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
                  <div className="h-3 w-32 rounded-full bg-gray-100 dark:bg-gray-700/60 shimmer-dark" />
                </div>
                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
              </div>
            ))}
          </div>
        </div>

        {/* Deposito skeleton */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 shimmer-dark" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
                  <div className="h-3 w-36 rounded-full bg-gray-100 dark:bg-gray-700/60 shimmer-dark" />
                </div>
                <div className="h-4 w-20 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
