import { NextRequest, NextResponse } from 'next/server'
import { recognizeSong } from '@/lib/apis/recognition'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file has data
    if (audioFile.size === 0) {
      return NextResponse.json(
        { error: 'Audio file is empty. Please try recording again.' },
        { status: 400 }
      )
    }

    console.log(`[Recognize API] Received file: size=${audioFile.size} bytes, type=${audioFile.type}, name=${audioFile.name}`)

    // Convert File to Blob for the recognizeSong function
    // We need to ensure the blob has the correct type
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([arrayBuffer], { 
      type: audioFile.type || 'audio/webm'
    })

    // Validate blob was created correctly
    if (!audioBlob || audioBlob.size === 0) {
      return NextResponse.json(
        { error: 'Failed to process audio file' },
        { status: 400 }
      )
    }

    console.log(`[Recognize API] Created blob: size=${audioBlob.size} bytes, type=${audioBlob.type}`)

    // Call AudD API
    const result = await recognizeSong(audioBlob)

    if (result.status === 'error') {
      // Check if it's a configuration error (should be 500, not 400)
      const isConfigError = result.error?.includes('not configured') || 
                           result.error?.includes('API key')
      
      return NextResponse.json(
        { 
          error: result.error,
          details: isConfigError ? 'Please check your .env.local file and ensure AUDD_API_KEY is set.' : undefined
        },
        { status: isConfigError ? 500 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      song: result.result,
    })
  } catch (error) {
    console.error('Recognition API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to process audio'
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'Check server logs for more information'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const auddKey = process.env.AUDD_API_KEY
  const acrcloudKey = process.env.ACRCLOUD_ACCESS_KEY
  
  return NextResponse.json(
    { 
      message: 'Allegro Recognition API',
      endpoints: {
        POST: '/api/recognize - Upload audio for recognition',
      },
      configuration: {
        audd: auddKey ? 'configured' : 'missing (AUDD_API_KEY required)',
        acrcloud: acrcloudKey ? 'configured' : 'optional (not set)',
      }
    },
    { status: 200 }
  )
}

