// Audio recording utilities using Web Audio API

export interface AudioRecorderConfig {
  maxDuration?: number; // in seconds
  mimeType?: string;
  onAutoStop?: (audioBlob: Blob) => void; // Callback when auto-stop completes
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
      maxDuration: 20, // default 20 seconds
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

      // Start with timeslice to ensure data is captured periodically
      // This helps ensure we have data even if stop() is called abruptly
      this.mediaRecorder.start(100) // Request data every 100ms

      // Auto-stop after max duration
      if (this.config.maxDuration) {
        this.autoStopTimeout = setTimeout(async () => {
          if (this.mediaRecorder?.state === 'recording' && !this.isStopping) {
            try {
              const audioBlob = await this.stop()
              // Notify callback if provided
              if (this.config.onAutoStop) {
                this.config.onAutoStop(audioBlob)
              }
            } catch (error) {
              console.error('Auto-stop failed:', error)
            }
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
        // If already cleaned up but we have chunks, return them
        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
          resolve(audioBlob)
          return
        }
        reject(new Error('MediaRecorder not initialized'))
        return
      }

      this.isStopping = true

      // Set up handlers before stopping
      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'
        
        // Validate we have audio chunks
        if (this.audioChunks.length === 0) {
          console.error('No audio chunks captured')
          this.cleanup()
          this.isStopping = false
          reject(new Error('No audio data captured'))
          return
        }
        
        const audioBlob = new Blob(this.audioChunks, { type: mimeType })
        
        // Validate blob was created with data
        if (audioBlob.size === 0) {
          console.error('Audio blob is empty')
          this.cleanup()
          this.isStopping = false
          reject(new Error('Audio blob is empty'))
          return
        }
        
        this.cleanup()
        this.isStopping = false
        resolve(audioBlob)
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        // Even on error, try to return what we have
        if (this.audioChunks.length > 0) {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm'
          const audioBlob = new Blob(this.audioChunks, { type: mimeType })
          this.cleanup()
          this.isStopping = false
          resolve(audioBlob)
        } else {
          this.cleanup()
          this.isStopping = false
          reject(new Error('Recording failed'))
        }
      }

      if (this.mediaRecorder.state === 'recording') {
        // Request final data chunk before stopping
        this.mediaRecorder.requestData()
        this.mediaRecorder.stop()
      } else {
        // Already stopped, resolve immediately with existing chunks
        if (this.audioChunks.length === 0) {
          this.cleanup()
          this.isStopping = false
          reject(new Error('No audio data captured'))
          return
        }
        
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(this.audioChunks, { type: mimeType })
        
        if (audioBlob.size === 0) {
          this.cleanup()
          this.isStopping = false
          reject(new Error('Audio blob is empty'))
          return
        }
        
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

