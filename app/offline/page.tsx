'use client'

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] px-6 text-center">
      <div className="text-5xl mb-4">📡</div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Tidak Ada Koneksi
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Periksa koneksi internet kamu dan coba lagi.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-base px-6 py-2.5 rounded-xl text-sm font-medium"
      >
        Coba Lagi
      </button>
    </div>
  )
}
