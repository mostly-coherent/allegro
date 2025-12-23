'use client';

import React, { useState } from 'react';
import { useKeyDetector } from '@/lib/hooks/useKeyDetector';
import { getSuggestedChords, formatKey, NOTE_NAMES } from '@/lib/utils/keyDetection';

interface KeyDetectorProps {
  /** Callback when a key is detected with good confidence */
  onKeyDetected?: (key: string, mode: 'major' | 'minor', chords: string[]) => void;
}

export function KeyDetector({ onKeyDetected }: KeyDetectorProps) {
  const {
    startListening,
    stopListening,
    reset,
    result,
    isListening,
    error,
  } = useKeyDetector({
    bufferSize: 2048,
    minSamples: 15,
    smoothingFactor: 0.25,
  });

  const [hasNotifiedKey, setHasNotifiedKey] = useState(false);

  // Notify parent when we have a confident key detection (using useEffect to avoid setState during render)
  React.useEffect(() => {
    if (result.detectedKey && result.detectedKey.confidence > 0.6 && !hasNotifiedKey && onKeyDetected) {
      const chords = getSuggestedChords(result.detectedKey);
      onKeyDetected(result.detectedKey.key, result.detectedKey.mode, chords);
      setHasNotifiedKey(true);
    }
  }, [result.detectedKey, hasNotifiedKey, onKeyDetected]);

  const handleStart = async () => {
    setHasNotifiedKey(false);
    await startListening();
  };

  const handleStop = () => {
    stopListening();
  };

  const handleReset = () => {
    setHasNotifiedKey(false);
    reset();
  };

  // Get color based on confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.7) return 'text-green-600';
    if (confidence > 0.5) return 'text-amber-600';
    return 'text-slate-400';
  };

  // Get background color for chroma bars
  const getChromaBarColor = (value: number, maxValue: number) => {
    const intensity = maxValue > 0 ? value / maxValue : 0;
    if (intensity > 0.7) return 'bg-indigo-500';
    if (intensity > 0.4) return 'bg-indigo-400';
    if (intensity > 0.2) return 'bg-indigo-300';
    return 'bg-slate-200';
  };

  const maxChroma = Math.max(...result.chroma, 0.001);
  const suggestedChords = result.detectedKey ? getSuggestedChords(result.detectedKey) : [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <h3 className="text-lg font-semibold text-slate-900">Key Detection</h3>
          {isListening && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Listening
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {result.sampleCount} samples
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Key Display */}
      {result.detectedKey ? (
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-slate-900">
            {formatKey(result.detectedKey)}
          </div>
          <div className={`text-sm ${getConfidenceColor(result.detectedKey.confidence)}`}>
            {(result.detectedKey.confidence * 100).toFixed(0)}% confidence
          </div>
          {result.detectedKey.alternateKey && (
            <div className="text-xs text-slate-500">
              or possibly {formatKey(result.detectedKey.alternateKey)} ({(result.detectedKey.alternateKey.confidence * 100).toFixed(0)}%)
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-2xl text-slate-300 mb-2">—</div>
          <div className="text-sm text-slate-500">
            {isListening 
              ? 'Analyzing... play something!' 
              : 'Start listening to detect the key'}
          </div>
        </div>
      )}

      {/* Suggested Chords */}
      {suggestedChords.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Suggested Chords:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedChords.map((chord, i) => (
              <span 
                key={chord}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  i === 0 ? 'bg-indigo-100 text-indigo-800' : 
                  i < 4 ? 'bg-slate-100 text-slate-700' : 
                  'bg-slate-50 text-slate-500'
                }`}
              >
                {chord}
              </span>
            ))}
          </div>
          <div className="text-xs text-slate-400">
            First chord (I) is the tonic. Try I, IV, V, vi for a common progression.
          </div>
        </div>
      )}

      {/* Chroma Visualization */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-500">Pitch Class Distribution:</div>
        <div className="flex gap-1 h-16 items-end">
          {NOTE_NAMES.map((note, i) => {
            const value = result.chroma[i] || 0;
            const height = maxChroma > 0 ? (value / maxChroma) * 100 : 0;
            return (
              <div key={note} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={`w-full rounded-t transition-all duration-150 ${getChromaBarColor(value, maxChroma)}`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-[10px] text-slate-400">{note}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        {!isListening ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Key Detection
          </button>
        ) : (
          <>
            <button
              onClick={handleStop}
              aria-label="Stop key detection"
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              Stop
            </button>
            <button
              onClick={handleReset}
              aria-label="Reset key detection and clear data"
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-slate-500 text-center">
        Play a melody or chords for 5-10 seconds for best results. 
        Works best with clean, single-instrument audio.
      </div>
    </div>
  );
}

