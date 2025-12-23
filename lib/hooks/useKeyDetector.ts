/**
 * useKeyDetector Hook
 * 
 * Real-time key detection from microphone using Meyda.js
 * Accumulates chroma data over time for stable key estimation
 * 
 * Phase 6A: Core hook for key/mode detection
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { detectKeyFromChroma, type DetectedKey, type KeyDetectionResult } from '../utils/keyDetection';

// Meyda types - using generic type for the analyzer since Meyda's internal types are complex
// The analyzer object from Meyda.createMeydaAnalyzer() has start/stop methods
interface MeydaAnalyzerInstance {
  start: () => void;
  stop: () => void;
}
type MeydaAnalyzer = MeydaAnalyzerInstance;

interface UseKeyDetectorOptions {
  /** How often to update (ms). Lower = more responsive but more CPU */
  updateInterval?: number;
  /** Buffer size for FFT. Must be power of 2. Larger = more accuracy, more latency */
  bufferSize?: 512 | 1024 | 2048 | 4096;
  /** How many samples to accumulate before making a key decision */
  minSamples?: number;
  /** Weight for exponential moving average (0-1). Higher = more responsive, less stable */
  smoothingFactor?: number;
}

interface UseKeyDetectorReturn {
  /** Start listening for key detection */
  startListening: () => Promise<void>;
  /** Stop listening */
  stopListening: () => void;
  /** Reset accumulated data */
  reset: () => void;
  /** Current detection result */
  result: KeyDetectionResult;
  /** Whether we're currently listening */
  isListening: boolean;
  /** Any error that occurred */
  error: string | null;
}

export function useKeyDetector(options: UseKeyDetectorOptions = {}): UseKeyDetectorReturn {
  const {
    bufferSize = 2048,
    minSamples = 10,
    smoothingFactor = 0.3,
  } = options;

  const [result, setResult] = useState<KeyDetectionResult>({
    detectedKey: null,
    chroma: new Array(12).fill(0),
    isListening: false,
    sampleCount: 0,
  });
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const analyzerRef = useRef<MeydaAnalyzer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Accumulated chroma (exponential moving average)
  const accumulatedChromaRef = useRef<number[]>(new Array(12).fill(0));
  const sampleCountRef = useRef(0);

  const startListening = useCallback(async () => {
    try {
      setError(null);

      // Check browser support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access not supported in this browser');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } 
      });
      streamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create source from microphone
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Dynamically import Meyda (client-side only)
      const Meyda = (await import('meyda')).default;

      // Create Meyda analyzer
      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext,
        source,
        bufferSize,
        featureExtractors: ['chroma'],
        callback: (features: { chroma?: number[] }) => {
          if (features.chroma) {
            // Update accumulated chroma with exponential moving average
            const newChroma = accumulatedChromaRef.current.map((prev, i) => 
              prev * (1 - smoothingFactor) + (features.chroma?.[i] ?? 0) * smoothingFactor
            );
            accumulatedChromaRef.current = newChroma;
            sampleCountRef.current++;

            // Only update state periodically to avoid too many re-renders
            if (sampleCountRef.current % 5 === 0) {
              const detectedKey = sampleCountRef.current >= minSamples 
                ? detectKeyFromChroma(newChroma)
                : null;

              setResult({
                detectedKey,
                chroma: [...newChroma],
                isListening: true,
                sampleCount: sampleCountRef.current,
              });
            }
          }
        },
      });

      analyzerRef.current = analyzer;
      analyzer.start();
      setIsListening(true);
      setResult(prev => ({ ...prev, isListening: true }));

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start key detection';
      setError(message);
      console.error('Key detection error:', err);
    }
  }, [bufferSize, minSamples, smoothingFactor]);

  const stopListening = useCallback(() => {
    // Stop analyzer
    if (analyzerRef.current) {
      analyzerRef.current.stop();
      analyzerRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    sourceRef.current = null;
    setIsListening(false);
    setResult(prev => ({ ...prev, isListening: false }));
  }, []);

  const reset = useCallback(() => {
    accumulatedChromaRef.current = new Array(12).fill(0);
    sampleCountRef.current = 0;
    setResult({
      detectedKey: null,
      chroma: new Array(12).fill(0),
      isListening,
      sampleCount: 0,
    });
  }, [isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    startListening,
    stopListening,
    reset,
    result,
    isListening,
    error,
  };
}

