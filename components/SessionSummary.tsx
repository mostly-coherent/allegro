'use client';

/**
 * Session Summary Component
 * 
 * Phase 7B: Displays a summary of a practice session
 * Shows timeline of identified songs, stats, and achievements
 */

import type { SessionEvent, SongMatchEvent, ChordEvent, KeyChangeEvent, SessionStats } from '@/lib/hooks/useSessionHistory';
import type { Song } from '@/lib/data/songDatabase';
import { ChordDiagram } from './ChordDiagram';

interface SessionSummaryProps {
  events: SessionEvent[];
  stats: SessionStats;
  sessionStartTime: Date | null;
  onClose?: () => void;
  onGetCoaching?: (song: Song) => void;
}

export function SessionSummary({
  events,
  stats,
  sessionStartTime,
  onClose,
  onGetCoaching,
}: SessionSummaryProps) {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventIcon = (type: SessionEvent['type']) => {
    switch (type) {
      case 'song_match': return '🎵';
      case 'chord_detected': return '🎸';
      case 'key_change': return '🎹';
      case 'session_start': return '▶️';
      case 'session_end': return '⏹️';
      default: return '•';
    }
  };

  // Filter to show only important events for the timeline
  const timelineEvents = events.filter(e => 
    e.type === 'song_match' || 
    e.type === 'key_change' ||
    e.type === 'session_start' ||
    e.type === 'session_end'
  );

  // Get unique songs identified
  const uniqueSongs = new Map<string, { song: Song; count: number; confidence: 'high' | 'medium' | 'low' }>();
  events
    .filter(e => e.type === 'song_match')
    .forEach(e => {
      const data = e.data as SongMatchEvent;
      const existing = uniqueSongs.get(data.song.id);
      if (existing) {
        existing.count++;
        if (data.confidence === 'high') existing.confidence = 'high';
      } else {
        uniqueSongs.set(data.song.id, { 
          song: data.song, 
          count: 1, 
          confidence: data.confidence 
        });
      }
    });

  // Get chord frequency
  const chordCounts = new Map<string, number>();
  events
    .filter(e => e.type === 'chord_detected')
    .forEach(e => {
      const data = e.data as ChordEvent;
      const name = data.chord.displayName;
      chordCounts.set(name, (chordCounts.get(name) || 0) + 1);
    });
  
  const topChords = [...chordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Practice Session Summary</h2>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close session summary"
              className="text-white/80 hover:text-white text-2xl"
            >
              ×
            </button>
          )}
        </div>
        
        {sessionStartTime && (
          <p className="text-white/80">
            {sessionStartTime.toLocaleDateString([], { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })} at {formatTime(sessionStartTime)}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50">
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-purple-600">
            {formatDuration(stats.totalDuration)}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Duration</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-green-600">
            {stats.uniqueSongs}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Songs Played</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-indigo-600">
            {stats.uniqueChords}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Unique Chords</div>
        </div>
        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-amber-600">
            {stats.keysDetected.length || 0}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Keys Detected</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Songs Identified */}
        {uniqueSongs.size > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span>🎵</span> Songs You Practiced
            </h3>
            <div className="space-y-2">
              {[...uniqueSongs.values()].map(({ song, count, confidence }) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {confidence === 'high' ? '🎉' : '🎵'}
                    </span>
                    <div>
                      <div className="font-semibold">{song.title}</div>
                      <div className="text-sm text-slate-500">{song.artist}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {count > 1 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        ×{count}
                      </span>
                    )}
                    {onGetCoaching && (
                      <button
                        onClick={() => onGetCoaching(song)}
                        className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Get Tips
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Used Chords */}
        {topChords.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span>🎸</span> Most Played Chords
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {topChords.map(([chord, count]) => (
                <div key={chord} className="text-center">
                  <ChordDiagram chord={chord} size="sm" />
                  <div className="text-xs text-slate-500 mt-1">×{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keys Practiced */}
        {stats.keysDetected.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span>🎹</span> Keys Practiced
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.keysDetected.map((key) => (
                <span
                  key={key}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium"
                >
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {timelineEvents.length > 2 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span>⏱️</span> Session Timeline
            </h3>
            <div className="relative border-l-2 border-purple-200 ml-4 space-y-4">
              {timelineEvents.map((event, i) => (
                <div key={event.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute left-[-9px] w-4 h-4 rounded-full bg-white border-2 border-purple-400 flex items-center justify-center">
                    <span className="text-[10px]">{getEventIcon(event.type)}</span>
                  </div>
                  
                  {/* Event content */}
                  <div className="text-sm">
                    <span className="text-slate-400 text-xs mr-2">
                      {formatTime(event.timestamp)}
                    </span>
                    {event.type === 'song_match' && (
                      <span className="text-slate-700">
                        Detected &quot;{(event.data as SongMatchEvent).song.title}&quot;
                      </span>
                    )}
                    {event.type === 'key_change' && (
                      <span className="text-slate-700">
                        Key changed to {(event.data as KeyChangeEvent).key} {(event.data as KeyChangeEvent).mode}
                      </span>
                    )}
                    {event.type === 'session_start' && (
                      <span className="text-green-600 font-medium">Session started</span>
                    )}
                    {event.type === 'session_end' && (
                      <span className="text-slate-600 font-medium">Session ended</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Encouragement */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 text-center">
          {stats.uniqueSongs > 0 ? (
            <>
              <div className="text-3xl mb-2">🌟</div>
              <p className="text-slate-700">
                Great practice session! You worked on <strong>{stats.uniqueSongs}</strong> song{stats.uniqueSongs > 1 ? 's' : ''} 
                {stats.uniqueChords > 0 && <> and practiced <strong>{stats.uniqueChords}</strong> different chords</>}.
              </p>
              <p className="text-sm text-slate-500 mt-2">Keep up the amazing work!</p>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">🎵</div>
              <p className="text-slate-700">
                Practice makes progress! Come back and play more songs.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionSummary;

