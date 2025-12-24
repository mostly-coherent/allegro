'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">😕</div>
        <h1 className="text-3xl font-bold text-slate-900">
          Something went wrong!
        </h1>
        <p className="text-lg text-slate-600 max-w-md">
          We encountered an unexpected error. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
          </div>
        )}
        <div className="pt-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

