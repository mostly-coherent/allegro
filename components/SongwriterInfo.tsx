'use client'

import type { MusicBrainzMetadata } from '@/lib/types'

interface SongwriterInfoProps {
  metadata: MusicBrainzMetadata
}

export function SongwriterInfo({ metadata }: SongwriterInfoProps) {
  const { songwriters, composers } = metadata
  
  if (songwriters.length === 0 && composers.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <span className="text-2xl">✍️</span>
        Credits & Songwriters
      </h3>

      {/* Composers Section */}
      {composers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-600 uppercase tracking-wide">
            {composers.length === 1 ? 'Composer' : 'Composers'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {composers.map((composer) => (
              <div
                key={composer.id}
                className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2"
              >
                <p className="font-medium text-purple-900">{composer.name}</p>
                {composer.lifeSpan && (
                  <p className="text-xs text-purple-600">
                    {composer.lifeSpan.begin && new Date(composer.lifeSpan.begin).getFullYear()}
                    {composer.lifeSpan.end && ` - ${new Date(composer.lifeSpan.end).getFullYear()}`}
                    {!composer.lifeSpan.end && composer.lifeSpan.begin && ' - present'}
                  </p>
                )}
                {composer.country && (
                  <p className="text-xs text-purple-500">{composer.country}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Songwriters/Performers Section */}
      {songwriters.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-600 uppercase tracking-wide">
            {songwriters.length === 1 ? 'Artist' : 'Artists'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {songwriters.map((songwriter) => (
              <div
                key={songwriter.id}
                className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2"
              >
                <p className="font-medium text-blue-900">{songwriter.name}</p>
                {songwriter.disambiguation && (
                  <p className="text-xs text-blue-600">{songwriter.disambiguation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
        Data from MusicBrainz
      </p>
    </div>
  )
}

