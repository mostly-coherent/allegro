import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎵</div>
        <h1 className="text-3xl font-bold text-slate-900">
          Page Not Found
        </h1>
        <p className="text-lg text-slate-600 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

