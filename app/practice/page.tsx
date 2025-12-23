'use client';

/**
 * Practice Session Page - Phase 7
 * 
 * Background listening mode for continuous practice sessions.
 * Automatically detects and identifies songs as the child plays.
 */

import { useState, useCallback } from 'react';
import { BackgroundListener } from '@/components/BackgroundListener';
import { SessionSummary } from '@/components/SessionSummary';
import { useSessionHistory, type SessionStats } from '@/lib/hooks/useSessionHistory';
import type { Song } from '@/lib/data/songDatabase';

export default function PracticePage() {
  const [showSummary, setShowSummary] = useState(false);
  const [lastStats, setLastStats] = useState<SessionStats | null>(null);
  const [identifiedSongs, setIdentifiedSongs] = useState<Song[]>([]);
  
  const {
    events,
    getStats,
    sessionStartTime,
    isSessionActive,
  } = useSessionHistory();

  const handleSongIdentified = useCallback((song: Song, confidence: 'high' | 'medium' | 'low') => {
    if (confidence === 'high') {
      setIdentifiedSongs(prev => {
        const exists = prev.some(s => s.id === song.id);
        if (exists) return prev;
        return [...prev, song];
      });
    }
  }, []);

  const handleSessionEnd = useCallback((stats: SessionStats) => {
    setLastStats(stats);
    setShowSummary(true);
  }, []);

  const handleCloseSummary = () => {
    setShowSummary(false);
    setIdentifiedSongs([]);
  };

  const handleGetCoaching = (song: Song) => {
    // Navigate to main page with song pre-filled
    window.location.href = `/?song=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          🎧 Practice Mode
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Just practice naturally — we&apos;ll detect what songs you&apos;re playing!
        </p>
      </div>

      {/* Feature Overview */}
      {!isSessionActive && !showSummary && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">
            How Practice Mode Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">🎧</div>
              <h3 className="font-semibold text-slate-900">1. Start</h3>
              <p className="text-sm text-slate-600">
                Click start and place your device near the instrument
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">🎹</div>
              <h3 className="font-semibold text-slate-900">2. Practice</h3>
              <p className="text-sm text-slate-600">
                Just practice normally — no buttons to press
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">🔔</div>
              <h3 className="font-semibold text-slate-900">3. Detect</h3>
              <p className="text-sm text-slate-600">
                We&apos;ll identify songs and notify you
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold text-slate-900">4. Summary</h3>
              <p className="text-sm text-slate-600">
                See what you practiced when done
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session Summary Modal */}
      {showSummary && lastStats && (
        <SessionSummary
          events={events}
          stats={lastStats}
          sessionStartTime={sessionStartTime}
          onClose={handleCloseSummary}
          onGetCoaching={handleGetCoaching}
        />
      )}

      {/* Background Listener */}
      {!showSummary && (
        <BackgroundListener
          onSongIdentified={handleSongIdentified}
          onSessionEnd={handleSessionEnd}
          notificationsEnabled={true}
        />
      )}

      {/* Tips */}
      {!showSummary && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-2">
                Tips for Best Results
              </h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>• Place your device 2-3 feet from the instrument</li>
                <li>• Background listening works best in a quiet room</li>
                <li>• Play the main parts of songs (chorus, verses) for best detection</li>
                <li>• Don&apos;t worry about wrong notes — we can handle imperfect playing!</li>
                <li>• Enable notifications to get alerts when songs are identified</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex justify-center gap-6 text-sm">
        <a 
          href="/play-along"
          className="text-purple-600 hover:text-purple-900 underline"
        >
          Play Along Mode (Manual)
        </a>
        <a 
          href="/"
          className="text-slate-600 hover:text-slate-900 underline"
        >
          ← Back to Song Recognition
        </a>
      </div>

      {/* Battery Notice */}
      <div className="text-center text-xs text-slate-400">
        <p>💡 Background listening uses continuous microphone access. 
          Keep your device plugged in for longer sessions.</p>
      </div>
    </div>
  );
}

