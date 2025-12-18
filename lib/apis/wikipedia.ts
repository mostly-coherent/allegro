// Wikipedia API client for biographical information and fun facts
// API Docs: https://en.wikipedia.org/api/rest_v1/

import type { WikipediaInfo } from '@/lib/types'

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/api/rest_v1'
const WIKIPEDIA_ACTION_API = 'https://en.wikipedia.org/w/api.php'

interface WikipediaSummary {
  title: string
  extract: string
  description?: string
  thumbnail?: {
    source: string
    width: number
    height: number
  }
  content_urls?: {
    desktop: {
      page: string
    }
  }
}

export async function getArtistSummary(artistName: string): Promise<WikipediaInfo | null> {
  try {
    // Clean up artist name for Wikipedia search
    const searchTerm = artistName.replace(/\s+/g, '_')
    
    // First try direct page lookup
    const directUrl = `${WIKIPEDIA_API_URL}/page/summary/${encodeURIComponent(searchTerm)}`
    
    let response = await fetch(directUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Allegro/1.0 (https://github.com/jmbeh/Allegro)',
      },
    })

    // If direct lookup fails, try search
    if (!response.ok) {
      const searchResult = await searchWikipedia(artistName)
      if (!searchResult) {
        return null
      }
      
      const searchUrl = `${WIKIPEDIA_API_URL}/page/summary/${encodeURIComponent(searchResult)}`
      response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Allegro/1.0 (https://github.com/jmbeh/Allegro)',
        },
      })
      
      if (!response.ok) {
        return null
      }
    }

    const data: WikipediaSummary = await response.json()

    return {
      title: data.title,
      summary: data.extract,
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
      thumbnail: data.thumbnail?.source,
    }
  } catch (error) {
    console.error('Wikipedia API error:', error)
    return null
  }
}

async function searchWikipedia(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: '1',
      format: 'json',
      origin: '*',
    })

    const response = await fetch(`${WIKIPEDIA_ACTION_API}?${params}`, {
      headers: {
        'User-Agent': 'Allegro/1.0 (https://github.com/jmbeh/Allegro)',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.query?.search?.length > 0) {
      return data.query.search[0].title
    }
    
    return null
  } catch (error) {
    console.error('Wikipedia search error:', error)
    return null
  }
}

export async function getSongFacts(songTitle: string, artistName: string): Promise<WikipediaInfo | null> {
  try {
    // Try searching for the song specifically
    const songQuery = `${songTitle} ${artistName} song`
    const searchResult = await searchWikipedia(songQuery)
    
    if (!searchResult) {
      // Fall back to artist info
      return await getArtistSummary(artistName)
    }

    const url = `${WIKIPEDIA_API_URL}/page/summary/${encodeURIComponent(searchResult)}`
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Allegro/1.0 (https://github.com/jmbeh/Allegro)',
      },
    })

    if (!response.ok) {
      return await getArtistSummary(artistName)
    }

    const data: WikipediaSummary = await response.json()

    return {
      title: data.title,
      summary: data.extract,
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
      thumbnail: data.thumbnail?.source,
    }
  } catch (error) {
    console.error('Wikipedia song facts error:', error)
    return null
  }
}

export function extractFunFacts(summary: string): string[] {
  // Split summary into sentences and extract interesting facts
  const sentences = summary
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200)

  // Filter for interesting facts (contains dates, numbers, awards, etc.)
  const interestingPatterns = [
    /\b(born|died|founded|formed|released|won|awarded|sold|million|billion|first|debut|famous|known for)\b/i,
    /\b(Grammy|Oscar|Billboard|chart|hit|album|single|tour|concert)\b/i,
    /\b(19\d{2}|20\d{2})\b/, // Years
    /\b\d+\s*(million|billion|thousand)\b/i, // Large numbers
  ]

  const funFacts = sentences.filter(sentence => 
    interestingPatterns.some(pattern => pattern.test(sentence))
  )

  // Return top 3-5 facts, or first few sentences if no interesting facts found
  if (funFacts.length >= 2) {
    return funFacts.slice(0, 5).map(s => s + '.')
  }

  // Fall back to first 3 sentences
  return sentences.slice(0, 3).map(s => s + '.')
}

export async function getEnrichedArtistInfo(artistName: string): Promise<{
  info: WikipediaInfo | null
  funFacts: string[]
}> {
  const info = await getArtistSummary(artistName)
  
  if (!info) {
    return { info: null, funFacts: [] }
  }

  const funFacts = extractFunFacts(info.summary)
  
  return { info, funFacts }
}

