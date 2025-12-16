'use client'

import { SongwriterInfo } from './SongwriterInfo'
import { FunFacts } from './FunFacts'
import type { MusicBrainzMetadata, WikipediaInfo } from '@/lib/types'

interface MetadataSectionProps {
  metadata: MusicBrainzMetadata | null
  wikipediaInfo: WikipediaInfo | null
  funFacts: string[]
  isLoading: boolean
}

export function MetadataSection({ 
  metadata, 
  wikipediaInfo, 
  funFacts,
  isLoading 
}: MetadataSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton loaders */}
        <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-slate-200 rounded w-1/2"></div>
            <div className="h-10 bg-slate-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const hasMetadata = metadata && (metadata.songwriters.length > 0 || metadata.composers.length > 0)
  const hasWikipedia = wikipediaInfo && (funFacts.length > 0 || wikipediaInfo.summary)

  if (!hasMetadata && !hasWikipedia) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-slate-600">
          📚 No additional information found for this song.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Try a more well-known song for richer details!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hasMetadata && <SongwriterInfo metadata={metadata} />}
      {hasWikipedia && <FunFacts info={wikipediaInfo} funFacts={funFacts} />}
    </div>
  )
}

