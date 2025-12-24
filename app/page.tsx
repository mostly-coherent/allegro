'use client'

import { useState, useEffect, useCallback } from 'react'
import { AudioRecorderComponent } from '@/components/AudioRecorder'
import { SongResult } from '@/components/SongResult'
import { LoadingState } from '@/components/LoadingState'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { MetadataSection } from '@/components/MetadataSection'
import { RecommendationsSection } from '@/components/RecommendationsSection'
import { CoachingSection } from '@/components/CoachingSection'
import { SettingsPanel } from '@/components/SettingsPanel'
import type { 
  Song, 
  LoadingState as LoadingStateType,
  MusicBrainzMetadata,
  WikipediaInfo,
  SpotifyTrack,
  CoachingContent,
  UserSettings,
} from '@/lib/types'

export default function Home() {
  const [loadingState, setLoadingState] = useState<LoadingStateType>('idle')
  const [song, setSong] = useState<Song | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Phase 2: Metadata state
  const [metadata, setMetadata] = useState<MusicBrainzMetadata | null>(null)
  const [wikipediaInfo, setWikipediaInfo] = useState<WikipediaInfo | null>(null)
  const [funFacts, setFunFacts] = useState<string[]>([])
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

  // Phase 3: Recommendations state
  const [recommendations, setRecommendations] = useState<SpotifyTrack[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState<string | undefined>()

  // Phase 4: Coaching state
  const [coaching, setCoaching] = useState<CoachingContent | null>(null)
  const [isLoadingCoaching, setIsLoadingCoaching] = useState(false)
  const [isCoachingFallback, setIsCoachingFallback] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    skillLevel: 'beginner',
  })

  // Fetch coaching when we have song and metadata
  const fetchCoaching = useCallback(async (
    currentSong: Song,
    currentMetadata: MusicBrainzMetadata | null,
    currentWikipedia: WikipediaInfo | null,
    currentFunFacts: string[]
  ) => {
    setIsLoadingCoaching(true)
    setCoaching(null)
    setIsCoachingFallback(false)

    try {
      const response = await fetch('/api/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song: currentSong,
          metadata: currentMetadata,
          wikipedia: currentWikipedia,
          funFacts: currentFunFacts,
          childAge: settings.childAge,
          skillLevel: settings.skillLevel,
        }),
      })

      if (!response.ok) {
        throw new Error(`Coaching API failed with status ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.coaching) {
        setCoaching(data.coaching)
        setIsCoachingFallback(data.fallback || false)
      }
    } catch (err) {
      console.error('Coaching fetch error:', err)
    } finally {
      setIsLoadingCoaching(false)
    }
  }, [settings])

  // Fetch metadata when song is identified
  useEffect(() => {
    if (song && loadingState === 'complete') {
      fetchMetadata(song.title, song.artist)
      fetchRecommendations(song.title, song.artist)
    }
  }, [song, loadingState])

  // Fetch coaching when metadata is ready
  useEffect(() => {
    if (song && loadingState === 'complete' && !isLoadingMetadata) {
      fetchCoaching(song, metadata, wikipediaInfo, funFacts)
    }
  }, [song, loadingState, isLoadingMetadata, metadata, wikipediaInfo, funFacts, fetchCoaching])

  const fetchMetadata = async (title: string, artist: string) => {
    setIsLoadingMetadata(true)
    setMetadata(null)
    setWikipediaInfo(null)
    setFunFacts([])

    try {
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist }),
      })

      if (response.ok) {
        const data = await response.json()
        setMetadata(data.musicbrainz)
        setWikipediaInfo(data.wikipedia)
        setFunFacts(data.funFacts || [])
      }
    } catch (err) {
      console.error('Metadata fetch error:', err)
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  const fetchRecommendations = async (title: string, artist: string) => {
    setIsLoadingRecommendations(true)
    setRecommendations([])
    setRecommendationsError(undefined)

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist, limit: 5 }),
      })

      if (!response.ok) {
        throw new Error(`Recommendations API failed with status ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data.recommendations || [])
      } else {
        setRecommendationsError(data.error || 'Could not load recommendations')
      }
    } catch (err) {
      console.error('Recommendations fetch error:', err)
      setRecommendationsError('Failed to load recommendations')
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setLoadingState('recognizing')
      setError(null)
      setSong(null)
      setMetadata(null)
      setWikipediaInfo(null)
      setFunFacts([])
      setCoaching(null)

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/recognize', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Recognition API failed with status ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setSong(data.song)
      setLoadingState('complete')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to recognize song'
      setError(errorMessage)
      setLoadingState('error')
      console.error('Recognition error:', err)
    }
  }

  const handleRetry = () => {
    setLoadingState('idle')
    setError(null)
    setSong(null)
    setMetadata(null)
    setWikipediaInfo(null)
    setFunFacts([])
    setRecommendations([])
    setRecommendationsError(undefined)
    setCoaching(null)
  }

  const handleSettingsChange = (newSettings: UserSettings) => {
    setSettings(newSettings)
    // Re-fetch coaching with new settings if we have a song
    if (song && !isLoadingMetadata) {
      fetchCoaching(song, metadata, wikipediaInfo, funFacts)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          Music Practice Companion
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Turn passive listening into active engagement. Identify what your kids are playing and get smart coaching suggestions.
        </p>
      </div>

      {/* Settings Panel - Always visible */}
      {loadingState === 'idle' && (
        <SettingsPanel 
          settings={settings} 
          onSettingsChange={handleSettingsChange} 
        />
      )}

      {/* How It Works */}
      {loadingState === 'idle' && !song && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">🎧</div>
              <h3 className="font-semibold text-slate-900">1. Listen</h3>
              <p className="text-sm text-slate-600">
                Tap the button when your child starts playing
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="font-semibold text-slate-900">2. Identify</h3>
              <p className="text-sm text-slate-600">
                We&apos;ll recognize the song from their practice
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="font-semibold text-slate-900">3. Engage</h3>
              <p className="text-sm text-slate-600">
                Get personalized coaching suggestions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audio Recorder */}
      {loadingState === 'idle' && (
        <AudioRecorderComponent
          onRecordingComplete={handleRecordingComplete}
          maxDuration={20}
          disabled={loadingState !== 'idle'}
        />
      )}

      {/* Loading State */}
      {loadingState !== 'idle' && loadingState !== 'complete' && loadingState !== 'error' && (
        <LoadingState state={loadingState} />
      )}

      {/* Error Display */}
      {loadingState === 'error' && error && (
        <ErrorDisplay error={error} onRetry={handleRetry} />
      )}

      {/* Results */}
      {loadingState === 'complete' && song && (
        <div className="space-y-6">
          <SongResult song={song} />
          
          {/* Phase 4: Coaching Section - THE MAIN FEATURE! */}
          <CoachingSection
            coaching={coaching}
            isLoading={isLoadingCoaching}
            isFallback={isCoachingFallback}
          />
          
          {/* Phase 2: Metadata Section */}
          <MetadataSection
            metadata={metadata}
            wikipediaInfo={wikipediaInfo}
            funFacts={funFacts}
            isLoading={isLoadingMetadata}
          />

          {/* Phase 3: Recommendations Section */}
          <RecommendationsSection
            recommendations={recommendations}
            isLoading={isLoadingRecommendations}
            error={recommendationsError}
          />

          {/* Try Another Button */}
          <div className="text-center">
            <button
              onClick={handleRetry}
              className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              Listen to Another Song
            </button>
          </div>
        </div>
      )}

      {/* Play Along Mode Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="text-3xl">🎸</div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">
              New: Play Along Mode
            </h3>
            <p className="text-sm text-slate-700 mb-3">
              Can&apos;t identify the song? No problem! Detect what key they&apos;re playing in and jam along on guitar with suggested chords.
            </p>
            <a 
              href="/play-along"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <span>Try Play Along Mode</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="text-3xl">💡</div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">
              Tips for Best Results
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Place your phone/computer near the practice area</li>
              <li>• Start recording during a distinctive part of the song</li>
              <li>• Let them play for at least 5-10 seconds</li>
              <li>• Set your child&apos;s age above for personalized suggestions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
