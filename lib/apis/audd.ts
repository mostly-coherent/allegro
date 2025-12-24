// AudD API client for music recognition

import type { Song, RecognitionResponse } from '@/lib/types'
import FormData from 'form-data'
import axios from 'axios'

const AUDD_API_URL = 'https://api.audd.io/'

export async function recognizeSong(audioBlob: Blob | File): Promise<RecognitionResponse> {
  try {
    const apiKey = process.env.AUDD_API_KEY
    
    if (!apiKey) {
      throw new Error('AUDD_API_KEY not configured')
    }

    // Validate blob has data
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Audio blob is empty')
    }

    const fileSize = audioBlob.size
    const fileType = audioBlob.type || 'audio/webm'
    const fileName = audioBlob instanceof File ? audioBlob.name : 
                     (fileType.includes('webm') ? 'recording.webm' : 
                      fileType.includes('ogg') ? 'recording.ogg' : 
                      fileType.includes('mp4') ? 'recording.m4a' :
                      'recording.webm')

    console.log(`[AudD] Sending audio: size=${fileSize} bytes, type=${fileType}, fileName=${fileName}`)

    // Convert Blob/File to Buffer for Node.js form-data
    const arrayBuffer = await audioBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create form-data instance (Node.js compatible)
    // AudD API expects field name 'file' (not 'audio')
    const formData = new FormData()
    formData.append('api_token', apiKey)
    formData.append('file', buffer, {
      filename: fileName,
      contentType: fileType,
    })
    formData.append('return', 'apple_music,spotify')

    console.log(`[AudD] FormData created: buffer size=${buffer.length}, fileName=${fileName}`)

    // Use axios which properly handles form-data package
    let response
    try {
      response = await axios.post(AUDD_API_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
    } catch (axiosError: any) {
      // Axios throws for non-2xx responses, but we want to handle them
      if (axiosError.response) {
        response = axiosError.response
      } else {
        throw axiosError
      }
    }

    console.log(`[AudD] Response status: ${response.status} ${response.statusText || response.statusText}`)
    
    const data = response.data
    console.log(`[AudD] Full response data:`, JSON.stringify(data, null, 2))

    // Check for API-level errors
    if (data.status === 'error') {
      return {
        status: 'error',
        error: data.error?.error_message || data.error || 'Recognition failed',
      }
    }

    // Check HTTP status
    if (response.status !== 200) {
      const errorMsg = data.error?.error_message || 
                       data.error?.message ||
                       data.error || 
                       (typeof data === 'string' ? data : `AudD API error: ${response.status}`)
      
      return {
        status: 'error',
        error: errorMsg,
      }
    }

    // AudD returns status: 'success' even when no result is found
    // Check if result exists and has data
    if (!data.result || (typeof data.result === 'object' && Object.keys(data.result).length === 0)) {
      // Provide helpful feedback based on what we know
      const suggestions = [
        'Try recording for 15-20 seconds during a distinctive part of the song',
        'Make sure there\'s minimal background noise',
        'Record closer to the music source',
        'Try recording during the chorus or a well-known section'
      ]
      return {
        status: 'error',
        error: `Song not recognized. ${suggestions[0]}.`,
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

