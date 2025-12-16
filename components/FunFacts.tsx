'use client'

import Image from 'next/image'
import type { WikipediaInfo } from '@/lib/types'

interface FunFactsProps {
  info: WikipediaInfo
  funFacts: string[]
}

export function FunFacts({ info, funFacts }: FunFactsProps) {
  if (funFacts.length === 0 && !info.summary) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <span className="text-2xl">💡</span>
        Fun Facts & Trivia
      </h3>

      {/* Artist/Song Image */}
      {info.thumbnail && (
        <div className="flex justify-center">
          <Image
            src={info.thumbnail}
            alt={info.title}
            width={96}
            height={96}
            className="object-cover rounded-lg shadow-md"
            unoptimized
          />
        </div>
      )}

      {/* Fun Facts List */}
      {funFacts.length > 0 ? (
        <ul className="space-y-3">
          {funFacts.map((fact, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <p className="text-slate-700 text-sm leading-relaxed">{fact}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-600 text-sm leading-relaxed">
          {info.summary.length > 300 
            ? info.summary.substring(0, 300) + '...' 
            : info.summary}
        </p>
      )}

      {/* Link to Wikipedia */}
      <a
        href={info.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
        Learn more on Wikipedia
      </a>

      <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
        Source: Wikipedia
      </p>
    </div>
  )
}

