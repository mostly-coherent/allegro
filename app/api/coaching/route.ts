import { NextRequest, NextResponse } from 'next/server'
import { 
  generateCoachingContent, 
  getFallbackCoachingContent,
  checkOpenAICredentials 
} from '@/lib/apis/coaching'
import type { CoachingContent, Song, MusicBrainzMetadata, WikipediaInfo } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cache coaching content per song + age/skill combination
const coachingCache = new Map<string, {
  data: CoachingContent
  timestamp: number
}>()

const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7 // 7 days (content doesn't change)

function getCacheKey(
  title: string, 
  artist: string, 
  age?: number, 
  skillLevel?: string
): string {
  return `${title.toLowerCase()}|${artist.toLowerCase()}|${age || 'any'}|${skillLevel || 'any'}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      song, 
      metadata, 
      wikipedia, 
      funFacts,
      childAge, 
      skillLevel 
    } = body as {
      song: Song
      metadata?: MusicBrainzMetadata
      wikipedia?: WikipediaInfo
      funFacts?: string[]
      childAge?: number
      skillLevel?: 'beginner' | 'intermediate' | 'advanced'
    }

    if (!song?.title || !song?.artist) {
      return NextResponse.json(
        { error: 'Song title and artist are required' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = getCacheKey(song.title, song.artist, childAge, skillLevel)
    const cached = coachingCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        cached: true,
        coaching: cached.data,
      })
    }

    // Check if OpenAI is configured
    const isConfigured = await checkOpenAICredentials()
    
    let coaching: CoachingContent | null = null

    if (isConfigured) {
      // Generate with AI
      coaching = await generateCoachingContent({
        song,
        metadata,
        wikipedia,
        funFacts,
        childAge,
        skillLevel,
      })
    }

    // Use fallback if AI failed or not configured
    if (!coaching) {
      coaching = getFallbackCoachingContent(song)
      
      return NextResponse.json({
        success: true,
        cached: false,
        fallback: true,
        coaching,
      })
    }

    // Store in cache
    coachingCache.set(cacheKey, {
      data: coaching,
      timestamp: Date.now(),
    })

    // Clean up old cache entries
    if (coachingCache.size > 500) {
      const oldestKey = coachingCache.keys().next().value
      if (oldestKey) {
        coachingCache.delete(oldestKey)
      }
    }

    return NextResponse.json({
      success: true,
      cached: false,
      coaching,
    })
  } catch (error) {
    console.error('Coaching API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate coaching content',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const isConfigured = await checkOpenAICredentials()
  
  return NextResponse.json({
    message: 'Allegro Coaching API',
    configured: isConfigured,
    endpoints: {
      POST: '/api/coaching - Generate coaching content',
    },
    parameters: {
      song: 'Required - { title, artist, album?, releaseDate? }',
      metadata: 'Optional - MusicBrainz metadata',
      wikipedia: 'Optional - Wikipedia info',
      funFacts: 'Optional - Array of fun facts',
      childAge: 'Optional - Child age (5-18)',
      skillLevel: 'Optional - beginner | intermediate | advanced',
    },
    cache: {
      size: coachingCache.size,
      duration: '7 days',
    },
  })
}

