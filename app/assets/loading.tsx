import PageHeader from '@/components/layout/PageHeader'

export default function AssetsLoading() {
  return (
    <div>
      <PageHeader title="Aset" subtitle="Emas & Kekayaan" />
      <div className="px-4 space-y-4 pb-8">

        {/* Portfolio Overview Card skeleton */}
        <div className="bg-base-gradient rounded-2xl p-4 shadow-md">
          <div className="h-3 w-28 rounded-full bg-white/30 mb-1 shimmer" />
          <div className="h-9 w-44 rounded-full bg-white/30 mb-3 shimmer" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-2">
                <div className="h-2.5 w-12 rounded-full bg-white/30 mb-1.5 shimmer" />
                <div className="h-4 w-16 rounded-full bg-white/30 shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Tab Nav skeleton */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          <div className="flex-1 h-9 rounded-xl bg-white dark:bg-gray-700 shimmer-dark" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex-1 h-9 rounded-xl bg-gray-200/60 dark:bg-gray-700/40 shimmer-dark" />
          ))}
        </div>

        {/* Gold Summary Card skeleton */}
        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-4 relative shadow-md">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 shimmer" />
          <div className="h-3 w-28 rounded-full bg-white/30 mb-1 shimmer" />
          <div className="h-8 w-40 rounded-full bg-white/30 mb-3 shimmer" />
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/15 rounded-xl p-2">
              <div className="h-2.5 w-24 rounded-full bg-white/30 mb-1.5 shimmer" />
              <div className="h-4 w-20 rounded-full bg-white/30 shimmer" />
            </div>
            <div className="bg-white/15 rounded-xl p-2">
              <div className="h-2.5 w-24 rounded-full bg-white/30 mb-1.5 shimmer" />
              <div className="h-4 w-20 rounded-full bg-white/30 shimmer" />
            </div>
          </div>
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

      </div>
    </div>
  )
}
