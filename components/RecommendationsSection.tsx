'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import type { SpotifyTrack } from '@/lib/types'

interface RecommendationsSectionProps {
  recommendations: SpotifyTrack[]
  isLoading: boolean
  error?: string
}

export function RecommendationsSection({ 
  recommendations, 
  isLoading,
  error 
}: RecommendationsSectionProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup audio on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handlePlayPreview = (track: SpotifyTrack) => {
    if (!track.previewUrl) return

    if (playingId === track.id) {
      // Stop playing
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      // Stop previous and play new
      audioRef.current?.pause()
      audioRef.current = new Audio(track.previewUrl)
      audioRef.current.volume = 0.5
      audioRef.current.play()
      audioRef.current.onended = () => setPlayingId(null)
      setPlayingId(track.id)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <span className="text-2xl">🎵</span>
          What&apos;s Next?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-slate-600">
          🎵 Recommendations unavailable
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {error}
        </p>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <span className="text-2xl">🎵</span>
        What&apos;s Next?
      </h3>
      <p className="text-sm text-slate-600">
        Similar songs your child might enjoy learning:
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recommendations.map((track) => (
          <div 
            key={track.id} 
            className="group relative"
          >
            {/* Album Art */}
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-md mb-2">
              {track.album.images[0] ? (
                <Image
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
              )}
              
              {/* Play Preview Button (if available) */}
              {track.previewUrl && (
                <button
                  onClick={() => handlePlayPreview(track)}
                  aria-label={playingId === track.id ? `Pause ${track.name}` : `Play preview of ${track.name}`}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    {playingId === track.id ? (
                      <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-900 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              )}

              {/* Playing indicator */}
              {playingId === track.id && (
                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Playing
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="space-y-0.5">
              <a
                href={track.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-medium text-sm text-slate-900 hover:text-primary-600 truncate transition-colors"
                title={track.name}
              >
                {track.name}
              </a>
              <p className="text-xs text-slate-500 truncate" title={track.artists.map(a => a.name).join(', ')}>
                {track.artists.map(a => a.name).join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Powered by Spotify
        </p>
        <a
          href="https://open.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
        >
          Open Spotify →
        </a>
      </div>
    </div>
  )
}

