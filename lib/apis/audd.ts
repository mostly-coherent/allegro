// AudD API client for music recognition

import type { Song, RecognitionResponse } from '@/lib/types'

const AUDD_API_URL = 'https://api.audd.io/'

export async function recognizeSong(audioBlob: Blob): Promise<RecognitionResponse> {
  try {
    const apiKey = process.env.AUDD_API_KEY
    
    if (!apiKey) {
      throw new Error('AUDD_API_KEY not configured')
    }

    const formData = new FormData()
    formData.append('api_token', apiKey)
    formData.append('audio', audioBlob, 'recording.mp3')
    formData.append('return', 'apple_music,spotify')

    const response = await fetch(AUDD_API_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`AudD API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === 'error') {
      return {
        status: 'error',
        error: data.error?.error_message || 'Recognition failed',
      }
    }

    if (!data.result) {
      return {
        status: 'error',
        error: 'Song not recognized. Try recording for a longer duration.',
      }
    }

    const result = data.result
    const song: Song = {
      title: result.title,
      artist: result.artist,
      album: result.album,
      releaseDate: result.release_date,
      label: result.label,
      timecode: result.timecode,
      songLink: result.song_link || result.spotify?.external_urls?.spotify,
    }

    return {
      status: 'success',
      result: song,
    }
  } catch (error) {
    console.error('AudD recognition error:', error)
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to recognize song',
    }
  }
}

export async function checkAuddStatus(): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.AUDD_API_KEY
    
    if (!apiKey) {
      return { success: false, error: 'API key not configured' }
    }

    const response = await fetch(`${AUDD_API_URL}?api_token=${apiKey}`)
    const data = await response.json()
    
    return { success: data.status !== 'error' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

