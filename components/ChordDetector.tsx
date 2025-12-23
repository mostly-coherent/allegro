'use client';

/**
 * ChordDetector Component
 * 
 * Phase 6B: Real-time chord detection with guitar diagram display
 */

import { useChordDetector } from '@/lib/hooks/useChordDetector';
import { ChordDiagram } from './ChordDiagram';
import { NOTE_NAMES } from '@/lib/utils/keyDetection';

interface ChordDetectorProps {
  onChordDetected?: (chord: string, key: string | null) => void;
}

export function ChordDetector({ onChordDetected }: ChordDetectorProps) {
  const {
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
  } = useChordDetector({
    bufferSize: 2048,
    minSamples: 8,
    smoothingFactor: 0.35,
    minChordDuration: 300,
  });

  const handleStart = async () => {
    await startListening();
  };

  const handleStop = () => {
    stopListening();
  };

  const handleReset = () => {
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
    if (intensity > 0.7) return 'bg-emerald-500';
    if (intensity > 0.4) return 'bg-emerald-400';
    if (intensity > 0.2) return 'bg-emerald-300';
    return 'bg-slate-200';
  };

  const maxChroma = Math.max(...chroma, 0.001);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎶</span>
          <h3 className="text-lg font-semibold text-slate-900">Chord Detection</h3>
          {isListening && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Listening
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {sampleCount} samples
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Chord Display */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        {/* Current Chord */}
        <div className="text-center space-y-4">
          {currentChord ? (
            <>
              <div className="text-6xl font-bold text-slate-900">
                {currentChord.displayName}
              </div>
              <div className={`text-sm ${getConfidenceColor(currentChord.confidence)}`}>
                {(currentChord.confidence * 100).toFixed(0)}% confidence
              </div>
            </>
          ) : (
            <div className="py-4">
              <div className="text-4xl text-slate-300 mb-2">—</div>
              <div className="text-sm text-slate-500">
                {isListening 
                  ? 'Play a chord...' 
                  : 'Start listening to detect chords'}
              </div>
            </div>
          )}
        </div>

        {/* Chord Diagram */}
        {currentChord && (
          <div className="bg-slate-50 rounded-xl p-4">
            <ChordDiagram chord={currentChord.displayName} size="lg" showName={false} />
          </div>
        )}
      </div>

      {/* Alternatives */}
      {alternativeChords.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-xs text-slate-500">Also possible:</span>
          {alternativeChords.map((alt, i) => (
            <span 
              key={i}
              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm"
            >
              {alt.displayName} ({(alt.confidence * 100).toFixed(0)}%)
            </span>
          ))}
        </div>
      )}

      {/* Key Context */}
      {detectedKey && (
        <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-800">
              Key: {detectedKey.key} {detectedKey.mode}
            </span>
            <span className="text-xs text-indigo-600">
              {(detectedKey.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
          
          {/* Predicted Next Chords */}
          {predictedNextChords.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-indigo-100">
              <span className="text-xs text-indigo-700">Next chord might be:</span>
              <div className="flex gap-1">
                {predictedNextChords.map((chord, i) => (
                  <span 
                    key={i}
                    className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-sm font-medium"
                  >
                    {chord}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chord History */}
      {chordHistory.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500">Recent Chords:</div>
          <div className="flex flex-wrap gap-1">
            {chordHistory.slice(-10).map((entry, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm"
              >
                {entry.chord.displayName}
              </span>
            ))}
            {currentChord && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-sm font-medium">
                {currentChord.displayName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chroma Visualization */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-500">Pitch Detection:</div>
        <div className="flex gap-1 h-12 items-end">
          {NOTE_NAMES.map((note, i) => {
            const value = chroma[i] || 0;
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
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Chord Detection
          </button>
        ) : (
          <>
            <button
              onClick={handleStop}
              aria-label="Stop chord detection"
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              Stop
            </button>
            <button
              onClick={handleReset}
              aria-label="Reset chord detection and clear history"
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-slate-500 text-center">
        Play one chord at a time and hold for 1-2 seconds for best detection.
        The diagram shows guitar fingering for the detected chord.
      </div>
    </div>
  );
}

export default ChordDetector;

