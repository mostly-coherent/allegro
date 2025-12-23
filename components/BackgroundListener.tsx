'use client';

/**
 * Background Listener Component
 * 
 * Phase 7: Continuous listening during practice sessions
 * Auto-detects when music starts/stops, identifies songs automatically
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useActivityDetector } from '@/lib/hooks/useActivityDetector';
import { useSessionHistory } from '@/lib/hooks/useSessionHistory';
import { useChordDetector } from '@/lib/hooks/useChordDetector';
import { suggestSongsFromChords, type SongMatch } from '@/lib/utils/fragmentMatcher';
import type { Song } from '@/lib/data/songDatabase';

interface BackgroundListenerProps {
  onSongIdentified?: (song: Song, confidence: 'high' | 'medium' | 'low') => void;
  onSessionEnd?: (stats: ReturnType<ReturnType<typeof useSessionHistory>['getStats']>) => void;
  notificationsEnabled?: boolean;
}

export function BackgroundListener({
  onSongIdentified,
  onSessionEnd,
  notificationsEnabled = true,
}: BackgroundListenerProps) {
  const {
    startMonitoring,
    stopMonitoring,
    activity,
    isMonitoring,
    error: activityError,
  } = useActivityDetector({
    activityThreshold: 0.015,
    silenceTimeout: 5000,
    activityMinDuration: 500,
  });

  const {
    startSession,
    endSession,
    addSongMatch,
    addChordDetected,
    addKeyChange,
    clearHistory,
    events,
    songMatches,
    getStats,
    isSessionActive,
    sessionStartTime,
    sessionDuration,
  } = useSessionHistory();

  const {
    startListening: startChordDetection,
    stopListening: stopChordDetection,
    currentChord,
    detectedKey,
    chordHistory,
    isListening: isChordListening,
    error: chordError,
  } = useChordDetector({
    bufferSize: 2048,
    minSamples: 8,
    smoothingFactor: 0.35,
    minChordDuration: 400,
  });

  const [isAutoListening, setIsAutoListening] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<SongMatch | null>(null);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const lastMatchRef = useRef<string | null>(null);
  const chordBufferRef = useRef<string[]>([]);
  const lastKeyRef = useRef<string | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [notificationsEnabled]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const showNotification = useCallback((song: Song, confidence: 'high' | 'medium' | 'low') => {
    if (notificationsEnabled && notificationPermission === 'granted') {
      const emoji = confidence === 'high' ? '🎉' : confidence === 'medium' ? '🎵' : '🤔';
      new Notification(`${emoji} Song Detected!`, {
        body: `Playing: "${song.title}" by ${song.artist}`,
        icon: '/allegro-icon.png',
        tag: 'song-detection',
      });
    }
  }, [notificationsEnabled, notificationPermission]);

  // Track chord history for matching
  useEffect(() => {
    if (currentChord && isSessionActive) {
      chordBufferRef.current.push(currentChord.displayName);
      
      // Keep last 15 chords
      if (chordBufferRef.current.length > 15) {
        chordBufferRef.current.shift();
      }

      // Log chord to session
      addChordDetected(currentChord, 500); // Approximate duration

      // Try to match when we have enough chords
      if (chordBufferRef.current.length >= 3) {
        const result = suggestSongsFromChords(
          chordBufferRef.current,
          detectedKey?.key,
          detectedKey?.mode
        );

        if (result.matches.length > 0) {
          const topMatch = result.matches[0];
          setCurrentMatch(topMatch);

          // Only notify for high confidence and if it's a new song
          if (topMatch.confidence === 'high' && lastMatchRef.current !== topMatch.song.id) {
            lastMatchRef.current = topMatch.song.id;
            
            addSongMatch(
              topMatch.song,
              topMatch.confidence,
              topMatch.score,
              chordBufferRef.current.slice()
            );

            // Add to recent songs
            setRecentSongs(prev => {
              const filtered = prev.filter(s => s.id !== topMatch.song.id);
              return [topMatch.song, ...filtered].slice(0, 5);
            });

            onSongIdentified?.(topMatch.song, topMatch.confidence);
            showNotification(topMatch.song, topMatch.confidence);
          }
        }
      }
    }
  }, [currentChord, isSessionActive, detectedKey, addChordDetected, addSongMatch, onSongIdentified, showNotification]);

  // Track key changes
  useEffect(() => {
    if (detectedKey && isSessionActive) {
      const keyStr = `${detectedKey.key} ${detectedKey.mode}`;
      if (keyStr !== lastKeyRef.current) {
        lastKeyRef.current = keyStr;
        addKeyChange(detectedKey.key, detectedKey.mode, detectedKey.confidence);
      }
    }
  }, [detectedKey, isSessionActive, addKeyChange]);

  // Auto-start chord detection when activity detected
  useEffect(() => {
    if (isAutoListening && isMonitoring) {
      if (activity.isActive && !isChordListening) {
        // Activity detected, start chord detection
        startChordDetection();
        if (!isSessionActive) {
          startSession();
        }
      } else if (!activity.isActive && isChordListening && activity.silenceDuration > 10000) {
        // Long silence, stop chord detection (but keep monitoring)
        stopChordDetection();
      }
    }
  }, [
    isAutoListening,
    isMonitoring,
    activity.isActive,
    activity.silenceDuration,
    isChordListening,
    isSessionActive,
    startChordDetection,
    stopChordDetection,
    startSession,
  ]);

  const handleStartAutoListen = async () => {
    setIsAutoListening(true);
    chordBufferRef.current = [];
    lastMatchRef.current = null;
    lastKeyRef.current = null;
    await startMonitoring();
    startSession();
  };

  const handleStopAutoListen = () => {
    setIsAutoListening(false);
    stopMonitoring();
    stopChordDetection();
    
    if (isSessionActive) {
      endSession();
      const stats = getStats();
      onSessionEnd?.(stats);
    }
  };

  const handleClearSession = () => {
    clearHistory();
    setRecentSongs([]);
    setCurrentMatch(null);
    chordBufferRef.current = [];
    lastMatchRef.current = null;
    lastKeyRef.current = null;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const error = activityError || chordError;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎧</span>
          <h3 className="text-lg font-semibold text-slate-900">Background Listening</h3>
        </div>
        
        {isSessionActive && (
          <div className="text-sm text-slate-500 font-mono">
            {formatDuration(sessionDuration)}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div className={`relative ${isMonitoring ? 'animate-pulse' : ''}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            isMonitoring
              ? activity.isActive
                ? 'bg-green-100 border-4 border-green-400'
                : 'bg-amber-100 border-4 border-amber-300'
              : 'bg-slate-100 border-4 border-slate-200'
          }`}>
            <span className="text-4xl">
              {isMonitoring 
                ? activity.isActive ? '🎵' : '👂' 
                : '⏸️'
              }
            </span>
          </div>
          
          {/* Volume indicator ring */}
          {isMonitoring && (
            <div 
              className="absolute inset-0 rounded-full border-4 border-purple-400 opacity-50"
              style={{
                transform: `scale(${1 + activity.volume * 0.5})`,
                transition: 'transform 100ms ease-out',
              }}
            />
          )}
        </div>
        
        <div className="text-center">
          <div className="text-xl font-semibold text-slate-900">
            {isMonitoring
              ? activity.isActive
                ? 'Playing Detected!'
                : 'Waiting for music...'
              : 'Not listening'
            }
          </div>
          <div className="text-sm text-slate-500">
            {isMonitoring 
              ? `Volume: ${(activity.volume * 100).toFixed(0)}%`
              : 'Click Start to begin'
            }
          </div>
        </div>
      </div>

      {/* Current Match */}
      {currentMatch && isMonitoring && (
        <div className={`p-4 rounded-lg border ${
          currentMatch.confidence === 'high'
            ? 'bg-green-50 border-green-200'
            : currentMatch.confidence === 'medium'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {currentMatch.confidence === 'high' ? '🎉' : '🎵'}
            </span>
            <div>
              <div className="font-semibold text-lg">{currentMatch.song.title}</div>
              <div className="text-sm opacity-75">{currentMatch.song.artist}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs uppercase tracking-wider opacity-50">
                {currentMatch.confidence} confidence
              </div>
              <div className="text-sm">{(currentMatch.score * 100).toFixed(0)}% match</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Songs */}
      {recentSongs.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-500">Songs detected this session:</div>
          <div className="flex flex-wrap gap-2">
            {recentSongs.map((song) => (
              <span
                key={song.id}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm"
              >
                {song.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Session Stats */}
      {isSessionActive && songMatches.length > 0 && (
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-slate-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {songMatches.length}
            </div>
            <div className="text-xs text-slate-500">Songs Detected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {chordHistory.length}
            </div>
            <div className="text-xs text-slate-500">Chords Played</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {detectedKey ? `${detectedKey.key} ${detectedKey.mode.charAt(0)}` : '—'}
            </div>
            <div className="text-xs text-slate-500">Current Key</div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Notification Permission */}
      {notificationsEnabled && notificationPermission === 'default' && (
        <button
          onClick={requestNotificationPermission}
          className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors"
        >
          🔔 Enable notifications for song detection
        </button>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        {!isMonitoring ? (
          <button
            onClick={handleStartAutoListen}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Background Listening
          </button>
        ) : (
          <>
            <button
              onClick={handleStopAutoListen}
              aria-label="Stop listening session"
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
            >
              Stop Session
            </button>
            {songMatches.length > 0 && (
              <button
                onClick={handleClearSession}
                aria-label="Clear session history"
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl shadow-md transition-all duration-200"
              >
                Clear
              </button>
            )}
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-slate-500 text-center space-y-1">
        <p>Background listening automatically detects when music starts and identifies songs.</p>
        <p>Place your device near the instrument and practice normally!</p>
      </div>
    </div>
  );
}

export default BackgroundListener;

