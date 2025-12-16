'use client'

import type { Song } from '@/lib/types'

interface SongResultProps {
  song: Song
}

export function SongResult({ song }: SongResultProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-2xl">
            🎵
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {song.title}
          </h2>
          <p className="text-lg text-slate-600 mb-2">
            by {song.artist}
          </p>
          
          {song.album && (
            <p className="text-sm text-slate-500">
              Album: {song.album}
            </p>
          )}
          
          {song.releaseDate && (
            <p className="text-sm text-slate-500">
              Released: {new Date(song.releaseDate).getFullYear()}
            </p>
          )}
        </div>
      </div>

      {song.songLink && (
        <a
          href={song.songLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          Listen on Spotify
        </a>
      )}
    </div>
  )
}

