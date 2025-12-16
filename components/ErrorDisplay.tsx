'use client'

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
      <div className="text-6xl mb-4">
        ⚠️
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900">
        Oops! Something went wrong
      </h3>
      
      <p className="text-slate-600 max-w-md mx-auto">
        {error}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}

      <div className="pt-4 border-t border-slate-200 mt-6">
        <p className="text-sm text-slate-500">
          Tips for better results:
        </p>
        <ul className="text-sm text-slate-600 space-y-1 mt-2">
          <li>• Record for at least 5-10 seconds</li>
          <li>• Ensure the instrument is clearly audible</li>
          <li>• Try recording during a distinctive part of the song</li>
          <li>• Minimize background noise</li>
        </ul>
      </div>
    </div>
  )
}

