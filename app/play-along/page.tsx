'use client';

import { useState, useCallback } from 'react';
import { KeyDetector } from '@/components/KeyDetector';
import { ChordDetector } from '@/components/ChordDetector';
import { SongMatcher } from '@/components/SongMatcher';
import { ChordDiagram } from '@/components/ChordDiagram';
import type { Song } from '@/lib/data/songDatabase';

/**
 * Play Along Page - Phase 6A + 6B + 6C
 * 
 * Real-time key and chord detection to help parents jam along with their kids.
 * Three modes:
 * - Chord Mode (6B): Detect individual chords in real-time with guitar diagrams
 * - Key Mode (6A): Detect overall key, suggest chords for that key
 * - Song Mode (6C): Identify songs from chord progressions, connect to coaching
 */

type Mode = 'chord' | 'key' | 'song';

export default function PlayAlongPage() {
  const [mode, setMode] = useState<Mode>('song'); // Default to Song Mode for 6C
  const [detectedKey, setDetectedKey] = useState<{
    key: string;
    mode: 'major' | 'minor';
    chords: string[];
  } | null>(null);
  const [identifiedSong, setIdentifiedSong] = useState<{
    song: Song;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);
  const [showCoachingLink, setShowCoachingLink] = useState(false);

  const handleKeyDetected = (key: string, keyMode: 'major' | 'minor', chords: string[]) => {
    setDetectedKey({ key, mode: keyMode, chords });
  };

  const handleSongIdentified = useCallback((song: Song, confidence: 'high' | 'medium' | 'low') => {
    setIdentifiedSong({ song, confidence });
    if (confidence === 'high') {
      setShowCoachingLink(true);
    }
  }, []);

  const getModeDescription = () => {
    switch (mode) {
      case 'chord':
        return { title: 'Chord Mode', play: 'a chord or note', detect: 'each chord in real-time', jam: 'Follow along with guitar chord diagrams!' };
      case 'key':
        return { title: 'Key Mode', play: 'a melody or song', detect: 'the musical key', jam: 'Use the suggested chords to play along!' };
      case 'song':
        return { title: 'Song Mode', play: 'part of a song', detect: 'which song it might be', jam: 'Get coaching tips and song facts!' };
    }
  };

  const modeDesc = getModeDescription();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          🎸 Play Along Mode
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Detect what your child is playing so you can grab your guitar and jam along!
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 rounded-xl p-1 flex-wrap justify-center gap-1">
          <button
            onClick={() => setMode('song')}
            className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              mode === 'song'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Song Mode
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Identify the song
            </span>
          </button>
          <button
            onClick={() => setMode('chord')}
            className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              mode === 'chord'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">🎶</span>
              Chord Mode
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              See each chord
            </span>
          </button>
          <button
            onClick={() => setMode('key')}
            className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              mode === 'key'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">🎵</span>
              Key Mode
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Detect overall key
            </span>
          </button>
        </div>
      </div>

      {/* How It Works - Context-aware */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          How {modeDesc.title} Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">🎹</div>
            <h3 className="font-semibold text-slate-900">1. They Play</h3>
            <p className="text-sm text-slate-600">
              Your child plays {modeDesc.play}
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="font-semibold text-slate-900">2. We Detect</h3>
            <p className="text-sm text-slate-600">
              The app identifies {modeDesc.detect}
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">🎸</div>
            <h3 className="font-semibold text-slate-900">3. You Jam</h3>
            <p className="text-sm text-slate-600">
              {modeDesc.jam}
            </p>
          </div>
        </div>
      </div>

      {/* Detector Component - Based on Mode */}
      {mode === 'song' && (
        <>
          <SongMatcher onSongIdentified={handleSongIdentified} />
          
          {/* Coaching Link (when song is confidently identified) */}
          {showCoachingLink && identifiedSong && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-xl font-bold text-slate-900">
                Great! They&apos;re playing &quot;{identifiedSong.song.title}&quot;!
              </h3>
              <p className="text-slate-600">
                Want personalized coaching tips and encouragement for this song?
              </p>
              <a
                href={`/?song=${encodeURIComponent(identifiedSong.song.title)}&artist=${encodeURIComponent(identifiedSong.song.artist)}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md transition-all"
              >
                <span>🧠</span>
                Get Coaching Tips
              </a>
              <button
                onClick={() => setShowCoachingLink(false)}
                className="block mx-auto text-slate-500 hover:text-slate-700 text-sm"
              >
                Maybe later
              </button>
            </div>
          )}
        </>
      )}
      
      {mode === 'chord' && <ChordDetector />}
      
      {mode === 'key' && (
        <>
          <KeyDetector onKeyDetected={handleKeyDetected} />

          {/* Quick Chord Reference (when key is detected) */}
          {detectedKey && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <h3 className="text-lg font-semibold text-slate-900">Quick Chord Reference</h3>
              </div>
              
              <p className="text-sm text-slate-600">
                In the key of <strong>{detectedKey.key} {detectedKey.mode}</strong>, 
                here&apos;s a common chord progression to try:
              </p>

              {/* Common Progression with Diagrams */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="text-sm font-medium text-indigo-800 mb-4">
                  Try this progression:
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {detectedKey.chords.slice(0, 4).map((chord, i) => (
                    <div key={i} className="text-center">
                      <ChordDiagram chord={chord} size="sm" />
                      {i < 3 && (
                        <span className="text-indigo-400 text-2xl ml-2">→</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-indigo-600 mt-4 text-center">
                  This is the I - ii - V - vi progression (or similar)
                </div>
              </div>

              {/* Tips */}
              <div className="text-sm text-slate-500 space-y-1">
                <p>💡 <strong>Tip:</strong> Start with just the first chord (I) and strum along to the rhythm.</p>
                <p>💡 <strong>Tip:</strong> If it sounds off, they might be in the relative minor/major key.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tips Card - Context-aware */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="text-3xl">💡</div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">
              Tips for Best Results
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Place your phone/computer close to the instrument</li>
              {mode === 'song' && (
                <>
                  <li>• Play 3-4 chords minimum for song identification</li>
                  <li>• The chorus or main progression works best</li>
                  <li>• Don&apos;t worry about wrong notes - we match fuzzy!</li>
                </>
              )}
              {mode === 'chord' && (
                <>
                  <li>• Play one chord at a time and hold for 1-2 seconds</li>
                  <li>• Works best with clear, strummed or arpeggiated chords</li>
                  <li>• Single notes will show the implied chord (if detectable)</li>
                </>
              )}
              {mode === 'key' && (
                <>
                  <li>• Works best with melodic playing (not just random notes)</li>
                  <li>• Wait 5-10 seconds for the key to stabilize</li>
                  <li>• Minor keys can sometimes be detected as their relative major</li>
                </>
              )}
              <li>• If confidence is low, have them play more deliberately</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex justify-center gap-6 text-sm">
        <a 
          href="/practice"
          className="text-purple-600 hover:text-purple-900 underline"
        >
          Practice Mode (Auto-Detect)
        </a>
        <a 
          href="/"
          className="text-slate-600 hover:text-slate-900 underline"
        >
          ← Back to Song Recognition
        </a>
      </div>
    </div>
  );
}
