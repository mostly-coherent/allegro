'use client';

/**
 * SongMatcher Component
 * 
 * Phase 6C: Displays "sounds like..." song matches from detected chords
 * Integrates with coaching content when a song is identified
 */

import { useState, useEffect, useCallback } from 'react';
import { useChordDetector } from '@/lib/hooks/useChordDetector';
import { ChordDiagram } from './ChordDiagram';
import { suggestSongsFromChords, findSimilarSongs, type SongMatch } from '@/lib/utils/fragmentMatcher';
import type { Song } from '@/lib/data/songDatabase';
import { NOTE_NAMES } from '@/lib/utils/keyDetection';

interface SongMatcherProps {
  onSongIdentified?: (song: Song, confidence: 'high' | 'medium' | 'low') => void;
}

export function SongMatcher({ onSongIdentified }: SongMatcherProps) {
  const {
    startListening,
    stopListening,
    reset,
    currentChord,
    detectedKey,
    chordHistory,
    chroma,
    isListening,
    sampleCount,
    error,
  } = useChordDetector({
    bufferSize: 2048,
    minSamples: 8,
    smoothingFactor: 0.35,
    minChordDuration: 400, // Slightly longer for song matching
  });

  const [matches, setMatches] = useState<SongMatch[]>([]);
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [message, setMessage] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [similarSongs, setSimilarSongs] = useState<Song[]>([]);

  // Update matches when chord history changes
  useEffect(() => {
    if (chordHistory.length >= 2) {
      const recentChords = chordHistory.slice(-10).map(h => h.chord.displayName);
      
      // Add current chord if different from last history entry
      if (currentChord && 
          (chordHistory.length === 0 || 
           chordHistory[chordHistory.length - 1].chord.displayName !== currentChord.displayName)) {
        recentChords.push(currentChord.displayName);
      }

      const result = suggestSongsFromChords(
        recentChords,
        detectedKey?.key,
        detectedKey?.mode
      );

      setMatches(result.matches);
      setSuggestions(result.suggestions);
      setMessage(result.message);

      // Notify parent if high confidence match
      if (result.matches.length > 0 && result.matches[0].confidence === 'high') {
        onSongIdentified?.(result.matches[0].song, 'high');
      }
    }
  }, [chordHistory, currentChord, detectedKey, onSongIdentified]);

  const handleStart = async () => {
    setMatches([]);
    setSuggestions([]);
    setMessage('');
    setSelectedSong(null);
    await startListening();
  };

  const handleStop = () => {
    stopListening();
  };

  const handleReset = () => {
    reset();
    setMatches([]);
    setSuggestions([]);
    setMessage('');
    setSelectedSong(null);
    setSimilarSongs([]);
  };

  const handleSongSelect = useCallback((song: Song) => {
    setSelectedSong(song);
    setSimilarSongs(findSimilarSongs(song.id, 3));
  }, []);

  const handleCloseSongDetails = () => {
    setSelectedSong(null);
    setSimilarSongs([]);
  };

  // Get color based on confidence
  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    if (confidence === 'high') return 'bg-green-100 text-green-800 border-green-200';
    if (confidence === 'medium') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getDifficultyBadge = (difficulty: Song['difficulty']) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      easy: 'bg-blue-100 text-blue-700',
      intermediate: 'bg-purple-100 text-purple-700',
    };
    return colors[difficulty];
  };

  const maxChroma = Math.max(...chroma, 0.001);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h3 className="text-lg font-semibold text-slate-900">Song Matcher</h3>
          {isListening && (
            <span className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Listening
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {chordHistory.length} chords detected
        </span>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Current Chord Display */}
      <div className="flex items-center justify-center gap-6">
        {currentChord ? (
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-900 mb-1">
              {currentChord.displayName}
            </div>
            {detectedKey && (
              <div className="text-sm text-slate-500">
                Key: {detectedKey.key} {detectedKey.mode}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-3xl text-slate-300 mb-2">🎵</div>
            <div className="text-sm text-slate-500">
              {isListening 
                ? 'Play a song or melody...' 
                : 'Start listening to identify songs'}
            </div>
          </div>
        )}
      </div>

      {/* Chord History */}
      {chordHistory.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500">Detected Progression:</div>
          <div className="flex flex-wrap gap-1">
            {chordHistory.slice(-12).map((entry, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm"
              >
                {entry.chord.displayName}
              </span>
            ))}
            {currentChord && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium animate-pulse">
                {currentChord.displayName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Song Matches */}
      {message && (
        <div className="space-y-3">
          <div className="font-medium text-slate-900">{message}</div>
          
          {matches.length > 0 && (
            <div className="space-y-2">
              {matches.map((match, i) => (
                <button
                  key={match.song.id}
                  onClick={() => handleSongSelect(match.song)}
                  className={`w-full text-left p-4 rounded-lg border transition-all hover:shadow-md ${
                    i === 0 ? getConfidenceColor(match.confidence) : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-lg">
                        {i === 0 && match.confidence === 'high' && '🎉 '}
                        {match.song.title}
                      </div>
                      <div className="text-sm opacity-75">{match.song.artist}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${getDifficultyBadge(match.song.difficulty)}`}>
                        {match.song.difficulty}
                      </span>
                      <div className="text-xs mt-1 opacity-60">
                        {(match.score * 100).toFixed(0)}% match
                      </div>
                    </div>
                  </div>
                  <div className="text-xs mt-2 opacity-60">{match.reason}</div>
                </button>
              ))}
            </div>
          )}

          {suggestions.length > 0 && matches.length === 0 && (
            <div className="grid gap-2">
              {suggestions.map((song) => (
                <button
                  key={song.id}
                  onClick={() => handleSongSelect(song)}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{song.title}</div>
                      <div className="text-sm text-slate-500">{song.artist}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyBadge(song.difficulty)}`}>
                      {song.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Song Details */}
      {selectedSong && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xl font-bold text-slate-900">{selectedSong.title}</h4>
              <p className="text-slate-600">{selectedSong.artist}</p>
            </div>
            <button
              onClick={handleCloseSongDetails}
              aria-label="Close song details"
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {/* Chord Progression */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Chord Progression:</div>
            <div className="flex flex-wrap gap-3">
              {selectedSong.chords.slice(0, 8).map((chord, i) => (
                <div key={i} className="text-center">
                  <ChordDiagram chord={chord} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Fun Fact */}
          {selectedSong.funFact && (
            <div className="bg-white rounded-lg p-3 text-sm text-slate-700">
              <span className="font-medium">💡 Fun Fact:</span> {selectedSong.funFact}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {selectedSong.tags.map(tag => (
              <span 
                key={tag} 
                className="px-2 py-0.5 bg-white text-slate-500 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Similar Songs */}
          {similarSongs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-purple-100">
              <div className="text-sm font-medium text-slate-700">If you like this, try:</div>
              <div className="flex flex-wrap gap-2">
                {similarSongs.map(song => (
                  <button
                    key={song.id}
                    onClick={() => handleSongSelect(song)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-50 rounded-lg text-sm text-slate-700 border border-purple-100 transition-colors"
                  >
                    {song.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chroma Visualization */}
      {isListening && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500">Audio Analysis:</div>
          <div className="flex gap-1 h-10 items-end">
            {NOTE_NAMES.map((note, i) => {
              const value = chroma[i] || 0;
              const height = maxChroma > 0 ? (value / maxChroma) * 100 : 0;
              return (
                <div key={note} className="flex-1 flex flex-col items-center gap-0.5">
                  <div 
                    className="w-full rounded-t bg-purple-400 transition-all duration-150"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-[9px] text-slate-400">{note}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        {!isListening ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Song Matching
          </button>
        ) : (
          <>
            <button
              onClick={handleStop}
              aria-label="Stop song matching"
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              Stop
            </button>
            <button
              onClick={handleReset}
              aria-label="Reset song matching and clear detected chords"
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-slate-500 text-center">
        Play part of a song (3-4 chords minimum) and we&apos;ll try to identify it!
        Works best with the chorus or main progression.
      </div>
    </div>
  );
}

export default SongMatcher;

