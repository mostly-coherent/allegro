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
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      song: result.result,
    })
  } catch (error) {
    console.error('Recognition API error:', error)
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Allegro Recognition API',
      endpoints: {
        POST: '/api/recognize - Upload audio for recognition',
      }
    },
    { status: 200 }
  )
}

