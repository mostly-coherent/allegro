'use client'

import { useState, useEffect, useCallback } from 'react'
import { AudioRecorder, checkMicrophoneSupport } from '@/lib/utils/audio'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  maxDuration?: number
  disabled?: boolean
}

export function AudioRecorderComponent({ 
  onRecordingComplete, 
  maxDuration = 20,
  disabled = false 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [recorder, setRecorder] = useState<AudioRecorder | null>(null)

  useEffect(() => {
    setIsSupported(checkMicrophoneSupport())
  }, [])

  const handleStop = useCallback(async () => {
    if (!recorder) return
    
    try {
      // Always try to stop - the stop() method handles already-stopped cases
      const audioBlob = await recorder.stop()
      setIsRecording(false)
      setRecorder(null)
      setDuration(0)
      onRecordingComplete(audioBlob)
    } catch (err) {
      // If stop fails, check if it's because it's already stopped
      if (err instanceof Error && (
        err.message.includes('not initialized') || 
        err.message.includes('already stopped') ||
        err.message.includes('Stop already in progress')
      )) {
        // Already stopped (likely by auto-stop), just clean up UI
        setIsRecording(false)
        setRecorder(null)
        setDuration(0)
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to stop recording')
      console.error('Stop recording error:', err)
    }
  }, [recorder, onRecordingComplete])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRecording && recorder) {
      interval = setInterval(() => {
        setDuration(prev => {
          // Just update duration - auto-stop is handled by AudioRecorder class
          if (prev >= maxDuration) {
            return maxDuration
          }
          return prev + 0.1
        })
      }, 100)
    } else {
      setDuration(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording, maxDuration, recorder])

  const handleStart = useCallback(async () => {
    try {
      setError(null)
      const newRecorder = new AudioRecorder({ 
        maxDuration,
        onAutoStop: (audioBlob) => {
          // Handle auto-stop completion
          setIsRecording(false)
          setRecorder(null)
          setDuration(0)
          onRecordingComplete(audioBlob)
        }
      })
      await newRecorder.start()
      setRecorder(newRecorder)
      setIsRecording(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      console.error('Recording error:', err)
    }
  }, [maxDuration, onRecordingComplete])

  const handleCancel = useCallback(() => {
    if (recorder) {
      recorder.cancel()
      setRecorder(null)
    }
    setIsRecording(false)
    setDuration(0)
    setError(null)
  }, [recorder])

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800 font-medium">Microphone not supported</p>
        <p className="text-red-600 text-sm mt-1">
          Your browser doesn&apos;t support audio recording. Please use a modern browser like Chrome, Safari, or Firefox.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center justify-center space-x-3">
          <div className="recording-indicator w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-lg font-medium text-slate-700">
            Recording... {duration.toFixed(1)}s / {maxDuration}s
          </span>
        </div>
      )}

      {/* Progress Bar */}
      {isRecording && (
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-primary-500 h-full transition-all duration-100 ease-linear"
            style={{ width: `${(duration / maxDuration) * 100}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        {!isRecording ? (
          <button
            onClick={handleStart}
            disabled={disabled}
            aria-label="Start listening to identify the song"
            className="px-8 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Listening
          </button>
        ) : (
          <>
            <button
              onClick={handleStop}
              aria-label="Stop recording and identify song"
              className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              ✓ Done
            </button>
            <button
              onClick={handleCancel}
              aria-label="Cancel recording"
              className="px-6 py-4 bg-slate-400 hover:bg-slate-500 text-white font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {!isRecording && (
        <p className="text-sm text-slate-600 text-center">
          Tap &quot;Start Listening&quot; when your child begins playing. Recording will automatically stop after {maxDuration} seconds.
        </p>
      )}
    </div>
  )
}

