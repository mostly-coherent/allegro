'use client';

/**
 * Session History Hook
 * 
 * Phase 7B: Tracks identified songs/chords during a practice session
 * Maintains a queue of all identifications for session summary
 */

import { useState, useCallback, useRef } from 'react';
import type { Song } from '../data/songDatabase';
import type { DetectedChord } from '../utils/chordDetection';

export interface SessionEvent {
  id: string;
  timestamp: Date;
  type: 'song_match' | 'chord_detected' | 'key_change' | 'session_start' | 'session_end';
  data: SongMatchEvent | ChordEvent | KeyChangeEvent | SessionMarker;
}

export interface SongMatchEvent {
  song: Song;
  confidence: 'high' | 'medium' | 'low';
  score: number;
  matchedChords: string[];
}

export interface ChordEvent {
  chord: DetectedChord;
  duration: number; // How long the chord was held (ms)
}

export interface KeyChangeEvent {
  key: string;
  mode: 'major' | 'minor';
  confidence: number;
}

export interface SessionMarker {
  note?: string;
}

export interface SessionStats {
  totalDuration: number; // Total session time (ms)
  activeDuration: number; // Time actually playing (ms)
  songsIdentified: number;
  uniqueSongs: number;
  chordsDetected: number;
  uniqueChords: number;
  keysDetected: string[];
  mostPlayedSong: Song | null;
  practiceStreak: number; // Consecutive days (future)
}

interface UseSessionHistoryReturn {
  /** Start a new session */
  startSession: () => void;
  /** End the current session */
  endSession: () => void;
  /** Add a song match to the session */
  addSongMatch: (song: Song, confidence: 'high' | 'medium' | 'low', score: number, matchedChords: string[]) => void;
  /** Add a chord detection to the session */
  addChordDetected: (chord: DetectedChord, duration: number) => void;
  /** Add a key change to the session */
  addKeyChange: (key: string, mode: 'major' | 'minor', confidence: number) => void;
  /** Clear session history */
  clearHistory: () => void;
  /** Get session events */
  events: SessionEvent[];
  /** Get only song matches */
  songMatches: SessionEvent[];
  /** Calculate session statistics */
  getStats: () => SessionStats;
  /** Is a session active */
  isSessionActive: boolean;
  /** Session start time */
  sessionStartTime: Date | null;
  /** Session duration so far */
  sessionDuration: number;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useSessionHistory(): UseSessionHistoryReturn {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const activeDurationRef = useRef(0);
  const lastActiveTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<number | null>(null);

  const startSession = useCallback(() => {
    const now = new Date();
    setSessionStartTime(now);
    setIsSessionActive(true);
    setSessionDuration(0);
    activeDurationRef.current = 0;
    
    // Add session start event
    setEvents([{
      id: generateId(),
      timestamp: now,
      type: 'session_start',
      data: {},
    }]);

    // Start duration timer
    durationIntervalRef.current = window.setInterval(() => {
      setSessionDuration(prev => prev + 1000);
    }, 1000);
  }, []);

  const endSession = useCallback(() => {
    const now = new Date();
    
    // Add session end event
    setEvents(prev => [...prev, {
      id: generateId(),
      timestamp: now,
      type: 'session_end',
      data: {},
    }]);

    setIsSessionActive(false);
    
    // Stop duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const addSongMatch = useCallback((
    song: Song,
    confidence: 'high' | 'medium' | 'low',
    score: number,
    matchedChords: string[]
  ) => {
    setEvents(prev => [...prev, {
      id: generateId(),
      timestamp: new Date(),
      type: 'song_match',
      data: { song, confidence, score, matchedChords },
    }]);
  }, []);

  const addChordDetected = useCallback((chord: DetectedChord, duration: number) => {
    // Track active time
    const now = Date.now();
    if (lastActiveTimeRef.current) {
      const gap = now - lastActiveTimeRef.current;
      if (gap < 5000) { // If less than 5 seconds gap, count as active
        activeDurationRef.current += Math.min(gap, duration);
      }
    }
    lastActiveTimeRef.current = now;

    setEvents(prev => [...prev, {
      id: generateId(),
      timestamp: new Date(),
      type: 'chord_detected',
      data: { chord, duration },
    }]);
  }, []);

  const addKeyChange = useCallback((
    key: string,
    mode: 'major' | 'minor',
    confidence: number
  ) => {
    setEvents(prev => [...prev, {
      id: generateId(),
      timestamp: new Date(),
      type: 'key_change',
      data: { key, mode, confidence },
    }]);
  }, []);

  const clearHistory = useCallback(() => {
    setEvents([]);
    setSessionStartTime(null);
    setIsSessionActive(false);
    setSessionDuration(0);
    activeDurationRef.current = 0;
    lastActiveTimeRef.current = null;
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const songMatches = events.filter(e => e.type === 'song_match');

  const getStats = useCallback((): SessionStats => {
    const songEvents = events.filter(e => e.type === 'song_match');
    const chordEvents = events.filter(e => e.type === 'chord_detected');
    const keyEvents = events.filter(e => e.type === 'key_change');

    // Count unique songs
    const songIds = new Set(songEvents.map(e => (e.data as SongMatchEvent).song.id));
    
    // Count unique chords
    const chordNames = new Set(chordEvents.map(e => (e.data as ChordEvent).chord.displayName));
    
    // Get keys detected
    const keys = [...new Set(keyEvents.map(e => {
      const data = e.data as KeyChangeEvent;
      return `${data.key} ${data.mode}`;
    }))];

    // Find most played song
    const songCounts = new Map<string, { count: number; song: Song }>();
    for (const event of songEvents) {
      const data = event.data as SongMatchEvent;
      const existing = songCounts.get(data.song.id);
      if (existing) {
        existing.count++;
      } else {
        songCounts.set(data.song.id, { count: 1, song: data.song });
      }
    }
    
    let mostPlayedSong: Song | null = null;
    let maxCount = 0;
    for (const { count, song } of songCounts.values()) {
      if (count > maxCount) {
        maxCount = count;
        mostPlayedSong = song;
      }
    }

    return {
      totalDuration: sessionDuration,
      activeDuration: activeDurationRef.current,
      songsIdentified: songEvents.length,
      uniqueSongs: songIds.size,
      chordsDetected: chordEvents.length,
      uniqueChords: chordNames.size,
      keysDetected: keys,
      mostPlayedSong,
      practiceStreak: 1, // Future: calculate from stored data
    };
  }, [events, sessionDuration]);

  return {
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
  };
}

export default useSessionHistory;

