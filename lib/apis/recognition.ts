// Unified recognition service that tries multiple providers
// Tries AudD first, falls back to ACRCloud if available

import { recognizeSong as recognizeAudD } from './audd'
import { recognizeSongACRCloud } from './acrcloud'
import type { RecognitionResponse } from '@/lib/types'

export async function recognizeSong(audioBlob: Blob | File): Promise<RecognitionResponse> {
  // Try AudD first (primary provider)
  console.log('[Recognition] Trying AudD...')
  const auddResult = await recognizeAudD(audioBlob)
  
  if (auddResult.status === 'success' && auddResult.result) {
    console.log('[Recognition] AudD succeeded')
    return auddResult
  }
  
  console.log('[Recognition] AudD failed, trying ACRCloud...')
  
  // Fallback to ACRCloud if AudD fails
  const acrcloudResult = await recognizeSongACRCloud(audioBlob)
  
  if (acrcloudResult.status === 'success' && acrcloudResult.result) {
    console.log('[Recognition] ACRCloud succeeded')
    return acrcloudResult
  }
  
  // Both failed - return the better error message
  console.log('[Recognition] Both providers failed')
  return {
    status: 'error',
    error: auddResult.error || acrcloudResult.error || 'Song not recognized by any service',
  }
}

