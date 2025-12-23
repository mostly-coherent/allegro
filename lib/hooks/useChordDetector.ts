/**
 * useChordDetector Hook
 * 
 * Phase 6B: Real-time chord detection from microphone
 * Extends useKeyDetector with individual chord identification
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { detectKeyFromChroma, type DetectedKey } from '../utils/keyDetection';
import { 
  detectChordWithAlternatives, 
  predictNextChords,
  type DetectedChord 
} from '../utils/chordDetection';

// Meyda types
interface MeydaAnalyzerInstance {
  start: () => void;
  stop: () => void;
}

interface ChordHistoryEntry {
  chord: DetectedChord;
  timestamp: number;
  duration: number;
}

interface UseChordDetectorOptions {
  /** Buffer size for FFT. Must be power of 2 */
  bufferSize?: 512 | 1024 | 2048 | 4096;
  /** Minimum samples before making chord decision */
  minSamples?: number;
  /** Smoothing factor for EMA (0-1) */
  smoothingFactor?: number;
  /** Minimum duration (ms) to register a chord change */
  minChordDuration?: number;
  /** Maximum history entries to keep */
  maxHistorySize?: number;
}

interface UseChordDetectorReturn {
  startListening: () => Promise<void>;
  stopListening: () => void;
  reset: () => void;
  
  // Current state
  currentChord: DetectedChord | null;
  alternativeChords: DetectedChord[];
  detectedKey: DetectedKey | null;
  predictedNextChords: string[];
  
  // History
  chordHistory: ChordHistoryEntry[];
  
  // Audio data
  chroma: number[];
  
  // Status
  isListening: boolean;
  sampleCount: number;
  error: string | null;
}

export function useChordDetector(options: UseChordDetectorOptions = {}): UseChordDetectorReturn {
  const {
    bufferSize = 2048,
    minSamples = 8,
    smoothingFactor = 0.35,
    minChordDuration = 300, // ms
    maxHistorySize = 20,
  } = options;

  // State
  const [currentChord, setCurrentChord] = useState<DetectedChord | null>(null);
  const [alternativeChords, setAlternativeChords] = useState<DetectedChord[]>([]);
  const [detectedKey, setDetectedKey] = useState<DetectedKey | null>(null);
  const [predictedNextChords, setPredictedNextChords] = useState<string[]>([]);
  const [chordHistory, setChordHistory] = useState<ChordHistoryEntry[]>([]);
  const [chroma, setChroma] = useState<number[]>(new Array(12).fill(0));
  const [isListening, setIsListening] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const analyzerRef = useRef<MeydaAnalyzerInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const accumulatedChromaRef = useRef<number[]>(new Array(12).fill(0));
  const sampleCountRef = useRef(0);
  const lastChordRef = useRef<string | null>(null);
  const lastChordTimeRef = useRef<number>(0);
  const keyAccumulatorRef = useRef<number[]>(new Array(12).fill(0));
  const keySampleCountRef = useRef(0);

  const startListening = useCallback(async () => {
    try {
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } 
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const Meyda = (await import('meyda')).default;

      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext,
        source,
        bufferSize,
        featureExtractors: ['chroma'],
        callback: (features: { chroma?: number[] }) => {
          if (features.chroma) {
            // Update accumulated chroma with EMA
            const newChroma = accumulatedChromaRef.current.map((prev, i) => 
              prev * (1 - smoothingFactor) + (features.chroma?.[i] ?? 0) * smoothingFactor
            );
            accumulatedChromaRef.current = newChroma;
            sampleCountRef.current++;

            // Also accumulate for key detection (longer average)
            keyAccumulatorRef.current = keyAccumulatorRef.current.map((prev, i) =>
              prev * 0.95 + (features.chroma?.[i] ?? 0) * 0.05
            );
            keySampleCountRef.current++;

            // Update state every few samples
            if (sampleCountRef.current % 3 === 0) {
              const now = Date.now();
              
              // Chord detection
              if (sampleCountRef.current >= minSamples) {
                const { chord, alternatives } = detectChordWithAlternatives(newChroma);
                
                if (chord) {
                  // Check if chord changed
                  const chordName = chord.displayName;
                  const timeSinceLastChord = now - lastChordTimeRef.current;
                  
                  if (chordName !== lastChordRef.current && timeSinceLastChord > minChordDuration) {
                    // Record in history
                    if (lastChordRef.current && currentChord) {
                      setChordHistory(prev => {
                        const entry: ChordHistoryEntry = {
                          chord: currentChord,
                          timestamp: lastChordTimeRef.current,
                          duration: timeSinceLastChord,
                        };
                        const newHistory = [...prev, entry];
                        return newHistory.slice(-maxHistorySize);
                      });
                    }
                    
                    lastChordRef.current = chordName;
                    lastChordTimeRef.current = now;
                  }
                  
                  setCurrentChord(chord);
                  setAlternativeChords(alternatives);
                }
              }

              // Key detection (less frequent, more samples)
              if (keySampleCountRef.current >= 30) {
                const key = detectKeyFromChroma(keyAccumulatorRef.current);
                if (key) {
                  setDetectedKey(key);
                  
                  // Update predictions based on current chord and key
                  if (currentChord) {
                    const predictions = predictNextChords(
                      currentChord.displayName,
                      key.key,
                      key.mode
                    );
                    setPredictedNextChords(predictions);
                  }
                }
              }

              setChroma([...newChroma]);
              setSampleCount(sampleCountRef.current);
            }
          }
        },
      });

      analyzerRef.current = analyzer;
      analyzer.start();
      setIsListening(true);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start chord detection';
      setError(message);
      console.error('Chord detection error:', err);
    }
  }, [bufferSize, minSamples, smoothingFactor, minChordDuration, maxHistorySize, currentChord]);

  const stopListening = useCallback(() => {
    if (analyzerRef.current) {
      analyzerRef.current.stop();
      analyzerRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    sourceRef.current = null;
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    accumulatedChromaRef.current = new Array(12).fill(0);
    keyAccumulatorRef.current = new Array(12).fill(0);
    sampleCountRef.current = 0;
    keySampleCountRef.current = 0;
    lastChordRef.current = null;
    lastChordTimeRef.current = 0;
    
    setCurrentChord(null);
    setAlternativeChords([]);
    setDetectedKey(null);
    setPredictedNextChords([]);
    setChordHistory([]);
    setChroma(new Array(12).fill(0));
    setSampleCount(0);
  }, []);

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
    currentChord,
    alternativeChords,
    detectedKey,
    predictedNextChords,
    chordHistory,
    chroma,
    isListening,
    sampleCount,
    error,
  };
}

