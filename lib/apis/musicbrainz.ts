// MusicBrainz API client for songwriter/composer metadata
// API Docs: https://musicbrainz.org/doc/MusicBrainz_API

import type { MusicBrainzMetadata, Songwriter, Composer } from '@/lib/types'

const MUSICBRAINZ_API_URL = 'https://musicbrainz.org/ws/2'

// Rate limiting: MusicBrainz requires 1 request per second max
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1100 // 1.1 seconds to be safe

async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  
  lastRequestTime = Date.now()
  return fetch(url, options)
}

function getHeaders(): HeadersInit {
  const userAgent = process.env.MUSICBRAINZ_USER_AGENT || 'Allegro/1.0 (https://github.com/jmbeh/Allegro)'
  return {
    'User-Agent': userAgent,
    'Accept': 'application/json',
  }
}

interface MusicBrainzRecording {
  id: string
  title: string
  'artist-credit'?: Array<{
    artist: {
      id: string
      name: string
      'sort-name': string
      disambiguation?: string
    }
  }>
  releases?: Array<{
    id: string
    title: string
    date?: string
  }>
}

interface MusicBrainzWork {
  id: string
  title: string
  relations?: Array<{
    type: string
    direction: string
    artist?: {
      id: string
      name: string
      'sort-name': string
      'life-span'?: {
        begin?: string
        end?: string
      }
      type?: string
      country?: string
    }
  }>
}

interface MusicBrainzSearchResult {
  recordings?: MusicBrainzRecording[]
  count: number
}

export async function searchRecording(title: string, artist: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`recording:"${title}" AND artist:"${artist}"`)
    const url = `${MUSICBRAINZ_API_URL}/recording?query=${query}&limit=1&fmt=json`
    
    const response = await rateLimitedFetch(url, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      console.error('MusicBrainz search error:', response.status)
      return null
    }

    const data: MusicBrainzSearchResult = await response.json()
    
    if (data.recordings && data.recordings.length > 0) {
      return data.recordings[0].id
    }
    
    return null
  } catch (error) {
    console.error('MusicBrainz search error:', error)
    return null
  }
}

export async function getRecordingDetails(recordingId: string): Promise<MusicBrainzRecording | null> {
  try {
    const url = `${MUSICBRAINZ_API_URL}/recording/${recordingId}?inc=artist-credits+releases+work-rels&fmt=json`
    
    const response = await rateLimitedFetch(url, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      console.error('MusicBrainz recording fetch error:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('MusicBrainz recording error:', error)
    return null
  }
}

export async function getWorkDetails(workId: string): Promise<MusicBrainzWork | null> {
  try {
    const url = `${MUSICBRAINZ_API_URL}/work/${workId}?inc=artist-rels&fmt=json`
    
    const response = await rateLimitedFetch(url, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      console.error('MusicBrainz work fetch error:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('MusicBrainz work error:', error)
    return null
  }
}

export async function getSongMetadata(title: string, artist: string): Promise<MusicBrainzMetadata | null> {
  try {
    // Step 1: Search for the recording
    const recordingId = await searchRecording(title, artist)
    
    if (!recordingId) {
      console.log('No recording found for:', title, artist)
      return null
    }

    // Step 2: Get recording details with work relationships
    const recording = await getRecordingDetails(recordingId)
    
    if (!recording) {
      return null
    }

    const songwriters: Songwriter[] = []
    const composers: Composer[] = []

    // Extract artist credits (performers)
    if (recording['artist-credit']) {
      for (const credit of recording['artist-credit']) {
        if (credit.artist) {
          songwriters.push({
            id: credit.artist.id,
            name: credit.artist.name,
            sortName: credit.artist['sort-name'],
            disambiguation: credit.artist.disambiguation,
          })
        }
      }
    }

    // Try to find work relationships for composers
    // This requires additional API calls for works
    const relations = (recording as MusicBrainzRecording & { relations?: Array<{ type: string; work?: { id: string } }> }).relations
    if (relations) {
      for (const rel of relations) {
        if (rel.type === 'performance' && rel.work?.id) {
          const work = await getWorkDetails(rel.work.id)
          if (work?.relations) {
            for (const workRel of work.relations) {
              if (workRel.artist && (workRel.type === 'composer' || workRel.type === 'writer')) {
                composers.push({
                  id: workRel.artist.id,
                  name: workRel.artist.name,
                  sortName: workRel.artist['sort-name'],
                  lifeSpan: workRel.artist['life-span'],
                  type: workRel.type,
                  country: workRel.artist.country,
                })
              }
            }
          }
        }
      }
    }

    return {
      songwriters,
      composers,
    }
  } catch (error) {
    console.error('MusicBrainz metadata error:', error)
    return null
  }
}

export async function getArtistInfo(artistName: string): Promise<{
  id: string
  name: string
  country?: string
  lifeSpan?: { begin?: string; end?: string }
  disambiguation?: string
} | null> {
  try {
    const query = encodeURIComponent(`artist:"${artistName}"`)
    const url = `${MUSICBRAINZ_API_URL}/artist?query=${query}&limit=1&fmt=json`
    
    const response = await rateLimitedFetch(url, {
      headers: getHeaders(),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.artists && data.artists.length > 0) {
      const artist = data.artists[0]
      return {
        id: artist.id,
        name: artist.name,
        country: artist.country,
        lifeSpan: artist['life-span'],
        disambiguation: artist.disambiguation,
      }
    }
    
    return null
  } catch (error) {
    console.error('MusicBrainz artist search error:', error)
    return null
  }
}

