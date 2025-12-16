import { NextRequest, NextResponse } from 'next/server'
import { getSongMetadata } from '@/lib/apis/musicbrainz'
import { getEnrichedArtistInfo, getSongFacts, extractFunFacts } from '@/lib/apis/wikipedia'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple in-memory cache for metadata
const metadataCache = new Map<string, {
  data: MetadataResponse
  timestamp: number
}>()

const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

interface MetadataResponse {
  musicbrainz: Awaited<ReturnType<typeof getSongMetadata>>
  wikipedia: Awaited<ReturnType<typeof getEnrichedArtistInfo>>['info']
  funFacts: string[]
}

function getCacheKey(title: string, artist: string): string {
  return `${title.toLowerCase()}|${artist.toLowerCase()}`
}

export async function POST(request: NextRequest) {
  try {
    const { title, artist } = await request.json()

    if (!title || !artist) {
      return NextResponse.json(
        { error: 'Title and artist are required' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = getCacheKey(title, artist)
    const cached = metadataCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        cached: true,
        ...cached.data,
      })
    }

    // Fetch metadata from multiple sources in parallel
    const [musicbrainzData, wikipediaResult, songFacts] = await Promise.all([
      getSongMetadata(title, artist),
      getEnrichedArtistInfo(artist),
      getSongFacts(title, artist),
    ])

    // Combine fun facts from both sources
    let allFunFacts = wikipediaResult.funFacts
    
    if (songFacts && songFacts.summary !== wikipediaResult.info?.summary) {
      const songSpecificFacts = extractFunFacts(songFacts.summary)
      allFunFacts = [...songSpecificFacts, ...allFunFacts].slice(0, 5)
    }

    const response: MetadataResponse = {
      musicbrainz: musicbrainzData,
      wikipedia: wikipediaResult.info || songFacts,
      funFacts: allFunFacts,
    }

    // Store in cache
    metadataCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    })

    // Clean up old cache entries (simple LRU-like behavior)
    if (metadataCache.size > 100) {
      const oldestKey = metadataCache.keys().next().value
      if (oldestKey) {
        metadataCache.delete(oldestKey)
      }
    }

    return NextResponse.json({
      success: true,
      cached: false,
      ...response,
    })
  } catch (error) {
    console.error('Metadata API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Allegro Metadata API',
    endpoints: {
      POST: '/api/metadata - Fetch song metadata (body: { title, artist })',
    },
    cache: {
      size: metadataCache.size,
      duration: '1 hour',
    },
  })
}

