import { NextRequest, NextResponse } from 'next/server'
import { recognizeSong } from '@/lib/apis/audd'

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

    // Convert File to Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { 
      type: audioFile.type 
    })

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

