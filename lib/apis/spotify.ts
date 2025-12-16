// Spotify API client for song recommendations
// Uses Client Credentials flow (no user login required)
// API Docs: https://developer.spotify.com/documentation/web-api

import type { SpotifyTrack } from '@/lib/types'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

// Token cache
let accessToken: string | null = null
let tokenExpiresAt: number = 0

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 1 minute buffer)
  if (accessToken && Date.now() < tokenExpiresAt - 60000) {
    return accessToken
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.status}`)
  }

  const data = await response.json()
  accessToken = data.access_token
  tokenExpiresAt = Date.now() + (data.expires_in * 1000)

  return accessToken as string
}

interface SpotifySearchResult {
  tracks: {
    items: Array<{
      id: string
      name: string
      artists: Array<{ id: string; name: string }>
      album: {
        name: string
        images: Array<{ url: string; height: number; width: number }>
      }
      preview_url: string | null
      external_urls: { spotify: string }
      popularity: number
    }>
  }
}

interface SpotifyRecommendationsResult {
  tracks: Array<{
    id: string
    name: string
    artists: Array<{ id: string; name: string }>
    album: {
      name: string
      images: Array<{ url: string; height: number; width: number }>
    }
    preview_url: string | null
    external_urls: { spotify: string }
  }>
}

export async function searchTrack(title: string, artist: string): Promise<string | null> {
  try {
    const token = await getAccessToken()
    const query = encodeURIComponent(`track:${title} artist:${artist}`)
    
    const response = await fetch(
      `${SPOTIFY_API_URL}/search?q=${query}&type=track&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Spotify search failed:', response.status)
      return null
    }

    const data: SpotifySearchResult = await response.json()
    
    if (data.tracks.items.length > 0) {
      return data.tracks.items[0].id
    }

    return null
  } catch (error) {
    console.error('Spotify search error:', error)
    return null
  }
}

export async function getRecommendations(
  trackId: string,
  limit: number = 5
): Promise<SpotifyTrack[]> {
  try {
    const token = await getAccessToken()
    
    const response = await fetch(
      `${SPOTIFY_API_URL}/recommendations?seed_tracks=${trackId}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Spotify recommendations failed:', response.status)
      return []
    }

    const data: SpotifyRecommendationsResult = await response.json()
    
    return data.tracks.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(a => ({ id: a.id, name: a.name })),
      album: {
        name: track.album.name,
        images: track.album.images,
      },
      previewUrl: track.preview_url || undefined,
      externalUrl: track.external_urls.spotify,
    }))
  } catch (error) {
    console.error('Spotify recommendations error:', error)
    return []
  }
}

export async function getTrackDetails(trackId: string): Promise<SpotifyTrack | null> {
  try {
    const token = await getAccessToken()
    
    const response = await fetch(
      `${SPOTIFY_API_URL}/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Spotify track fetch failed:', response.status)
      return null
    }

    const track = await response.json()
    
    return {
      id: track.id,
      name: track.name,
      artists: track.artists.map((a: { id: string; name: string }) => ({ 
        id: a.id, 
        name: a.name 
      })),
      album: {
        name: track.album.name,
        images: track.album.images,
      },
      previewUrl: track.preview_url || undefined,
      externalUrl: track.external_urls.spotify,
    }
  } catch (error) {
    console.error('Spotify track error:', error)
    return null
  }
}

export async function getSongRecommendations(
  title: string,
  artist: string,
  limit: number = 5
): Promise<SpotifyTrack[]> {
  try {
    // First, find the track on Spotify
    const trackId = await searchTrack(title, artist)
    
    if (!trackId) {
      console.log('Track not found on Spotify:', title, artist)
      return []
    }

    // Get recommendations based on this track
    const recommendations = await getRecommendations(trackId, limit)
    
    return recommendations
  } catch (error) {
    console.error('Song recommendations error:', error)
    return []
  }
}

export async function checkSpotifyCredentials(): Promise<boolean> {
  try {
    await getAccessToken()
    return true
  } catch {
    return false
  }
}

