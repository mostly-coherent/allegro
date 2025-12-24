// Audio recording utilities using Web Audio API

export interface AudioRecorderConfig {
  maxDuration?: number; // in seconds
  mimeType?: string;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private config: AudioRecorderConfig
  private autoStopTimeout: NodeJS.Timeout | null = null
  private isStopping: boolean = false

  constructor(config: AudioRecorderConfig = {}) {
    this.config = {
      maxDuration: 10, // default 10 seconds
      mimeType: 'audio/webm;codecs=opus',
      ...config,
    }
  }

  async start(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })

      // Determine best supported mime type
      const mimeType = this.getSupportedMimeType()
      
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType })
      this.audioChunks = []
      this.isStopping = false

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start()

      // Auto-stop after max duration
      if (this.config.maxDuration) {
        this.autoStopTimeout = setTimeout(() => {
          if (this.mediaRecorder?.state === 'recording' && !this.isStopping) {
            this.stop()
          }
        }, this.config.maxDuration * 1000)
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw new Error('Microphone access denied or not available')
    }
  }

  async stop(): Promise<Blob> {
    // Prevent multiple simultaneous stop calls
    if (this.isStopping) {
      return Promise.reject(new Error('Stop already in progress'))
    }

    // Clear auto-stop timeout if it exists
    if (this.autoStopTimeout) {
      clearTimeout(this.autoStopTimeout)
      this.autoStopTimeout = null
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'))
        return
      }

      this.isStopping = true

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'
        const audioBlob = new Blob(this.audioChunks, { type: mimeType })
        this.cleanup()
        this.isStopping = false
        resolve(audioBlob)
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        this.cleanup()
        this.isStopping = false
        reject(new Error('Recording failed'))
      }

      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop()
      } else {
        // Already stopped, resolve immediately
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(this.audioChunks, { type: mimeType })
        this.cleanup()
        this.isStopping = false
        resolve(audioBlob)
      }
    })
  }

  cancel(): void {
    // Clear auto-stop timeout if it exists
    if (this.autoStopTimeout) {
      clearTimeout(this.autoStopTimeout)
      this.autoStopTimeout = null
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
    }
    this.cleanup()
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    this.mediaRecorder = null
    this.audioChunks = []
    this.isStopping = false
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return '' // Browser will use default
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}

export function checkMicrophoneSupport(): boolean {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder === 'function'
  )
}

export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    console.error('Microphone permission denied:', error)
    return false
  }
}

