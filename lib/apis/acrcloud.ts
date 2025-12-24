// ACRCloud API client for music recognition
// ACRCloud is known for better accuracy with live/instrumental music

import type { Song, RecognitionResponse } from '@/lib/types'
import FormData from 'form-data'
import axios from 'axios'
import crypto from 'crypto'

const ACRCLOUD_API_URL = 'https://identify-us-west-2.acrcloud.com/v1/identify'

interface ACRCloudConfig {
  accessKey: string
  accessSecret: string
  host: string
}

function getACRCloudConfig(): ACRCloudConfig | null {
  const accessKey = process.env.ACRCLOUD_ACCESS_KEY
  const accessSecret = process.env.ACRCLOUD_ACCESS_SECRET
  
  if (!accessKey || !accessSecret) {
    return null
  }
  
  return {
    accessKey,
    accessSecret,
    host: 'identify-us-west-2.acrcloud.com'
  }
}

function generateACRCloudSignature(
  method: string,
  uri: string,
  accessKey: string,
  accessSecret: string
): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const signatureVersion = '1'
  const stringToSign = `${method}\n${uri}\n${accessKey}\n${signatureVersion}\n${timestamp}`
  const signature = crypto
    .createHmac('sha1', accessSecret)
    .update(stringToSign)
    .digest('base64')
  
  return signature
}

export async function recognizeSongACRCloud(audioBlob: Blob | File): Promise<RecognitionResponse> {
  try {
    const config = getACRCloudConfig()
    
    if (!config) {
      return {
        status: 'error',
        error: 'ACRCloud not configured (ACRCLOUD_ACCESS_KEY and ACRCLOUD_ACCESS_SECRET required)',
      }
    }

    // Validate blob has data
    if (!audioBlob || audioBlob.size === 0) {
      return {
        status: 'error',
        error: 'Audio blob is empty',
      }
    }

    const fileSize = audioBlob.size
    const fileType = audioBlob.type || 'audio/webm'
    
    console.log(`[ACRCloud] Sending audio: size=${fileSize} bytes, type=${fileType}`)

    // Convert Blob/File to Buffer
    const arrayBuffer = await audioBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Generate signature for ACRCloud
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = generateACRCloudSignature('POST', '/v1/identify', config.accessKey, config.accessSecret)
    
    // ACRCloud accepts multipart/form-data
    const formData = new FormData()
    formData.append('sample', buffer, {
      filename: 'recording.webm',
      contentType: fileType,
    })
    formData.append('sample_bytes', buffer.length.toString())
    formData.append('access_key', config.accessKey)
    formData.append('data_type', 'audio')
    formData.append('signature_version', '1')
    formData.append('signature', signature)
    formData.append('timestamp', timestamp.toString())

    console.log(`[ACRCloud] Request prepared: buffer size=${buffer.length}`)

    // Make request with form-data
    let response
    try {
      response = await axios.post(ACRCLOUD_API_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
    } catch (axiosError: any) {
      if (axiosError.response) {
        response = axiosError.response
      } else {
        throw axiosError
      }
    }

    console.log(`[ACRCloud] Response status: ${response.status}`)
    const data = response.data
    console.log(`[ACRCloud] Response data:`, JSON.stringify(data).substring(0, 500))

    // ACRCloud response structure
    if (data.status && data.status.code === 0 && data.metadata && data.metadata.music) {
      const music = data.metadata.music[0]
      const song: Song = {
        title: music.title || '',
        artist: music.artists?.[0]?.name || '',
        album: music.album?.name,
        releaseDate: music.release_date,
        songLink: music.external_metadata?.spotify?.track?.id 
          ? `https://open.spotify.com/track/${music.external_metadata.spotify.track.id}`
          : undefined,
      }

      return {
        status: 'success',
        result: song,
      }
    }

    // No match found
    return {
      status: 'error',
      error: 'Song not recognized by ACRCloud',
    }
  } catch (error) {
    console.error('ACRCloud recognition error:', error)
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to recognize song with ACRCloud',
    }
  }
}

export async function checkACRCloudStatus(): Promise<{ success: boolean; error?: string }> {
  const config = getACRCloudConfig()
  
  if (!config) {
    return { success: false, error: 'ACRCloud not configured' }
  }
  
  return { success: true }
}

