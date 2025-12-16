import { NextRequest, NextResponse } from 'next/server'
import { getSongRecommendations, checkSpotifyCredentials } from '@/lib/apis/spotify'
import type { SpotifyTrack } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple in-memory cache for recommendations
const recommendationsCache = new Map<string, {
  data: SpotifyTrack[]
  timestamp: number
}>()

const CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours (recommendations don't change often)

function getCacheKey(title: string, artist: string): string {
  return `${title.toLowerCase()}|${artist.toLowerCase()}`
}

export async function POST(request: NextRequest) {
  try {
    const { title, artist, limit = 5 } = await request.json()

    if (!title || !artist) {
      return NextResponse.json(
        { error: 'Title and artist are required' },
        { status: 400 }
      )
    }

    // Check if Spotify is configured
    const isConfigured = await checkSpotifyCredentials()
    if (!isConfigured) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Spotify not configured',
          recommendations: [],
        },
        { status: 200 } // Return 200 so UI can handle gracefully
      )
    }

    // Check cache first
    const cacheKey = getCacheKey(title, artist)
    const cached = recommendationsCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        cached: true,
        recommendations: cached.data,
      })
    }

    // Fetch recommendations from Spotify
    const recommendations = await getSongRecommendations(title, artist, limit)

    // Store in cache
    if (recommendations.length > 0) {
      recommendationsCache.set(cacheKey, {
        data: recommendations,
        timestamp: Date.now(),
      })

      // Clean up old cache entries
      if (recommendationsCache.size > 200) {
        const oldestKey = recommendationsCache.keys().next().value
        if (oldestKey) {
          recommendationsCache.delete(oldestKey)
        }
      }
    }

    return NextResponse.json({
      success: true,
      cached: false,
      recommendations,
    })
  } catch (error) {
    console.error('Recommendations API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch recommendations',
        recommendations: [],
      },
      { status: 200 } // Return 200 so UI can handle gracefully
    )
  }
}

export async function GET() {
  const isConfigured = await checkSpotifyCredentials()
  
  return NextResponse.json({
    message: 'Allegro Recommendations API',
    configured: isConfigured,
    endpoints: {
      POST: '/api/recommendations - Get song recommendations (body: { title, artist, limit? })',
    },
    cache: {
      size: recommendationsCache.size,
      duration: '24 hours',
    },
  })
}

