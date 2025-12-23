/**
 * Fragment Matcher Module
 * 
 * Phase 6C: Fuzzy matching to identify songs from chord fragments
 * Tolerates wrong notes, out-of-order chords, and imperfect playing
 */

import { SONG_DATABASE, type Song } from '../data/songDatabase';
import type { NoteName } from './keyDetection';

export interface ChordFragment {
  chord: string;
  timestamp: number;
}

export interface SongMatch {
  song: Song;
  score: number; // 0-1, how well it matches
  matchedChords: number; // How many chords matched
  totalChords: number; // Total chords in the song
  confidence: 'high' | 'medium' | 'low';
  reason: string; // Why we think it matches
}

/**
 * Normalize chord name for comparison
 * Handles enharmonics (C# = Db) and simplifies complex chords
 */
function normalizeChord(chord: string): string {
  // Remove any extra suffixes for basic comparison
  let normalized = chord.trim();
  
  // Convert sharps to a consistent format
  const enharmonicMap: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  };
  
  for (const [flat, sharp] of Object.entries(enharmonicMap)) {
    if (normalized.startsWith(flat)) {
      normalized = normalized.replace(flat, sharp);
    }
  }
  
  // Simplify extended chords for matching
  // maj7 -> major, m7 -> m, etc.
  normalized = normalized
    .replace(/maj7$/, '')
    .replace(/7$/, '')
    .replace(/m7$/, 'm')
    .replace(/dim7$/, 'dim')
    .replace(/sus[24]$/, '');
  
  return normalized;
}

/**
 * Check if two chords are similar enough to match
 */
function chordsMatch(a: string, b: string): boolean {
  const normA = normalizeChord(a);
  const normB = normalizeChord(b);
  
  // Exact match
  if (normA === normB) return true;
  
  // Check if one is the relative minor/major of the other
  // E.g., C and Am are related
  const relativePairs: [string, string][] = [
    ['C', 'Am'], ['G', 'Em'], ['D', 'Bm'], ['A', 'F#m'],
    ['E', 'C#m'], ['F', 'Dm'], ['Bb', 'Gm'],
  ];
  
  for (const [major, minor] of relativePairs) {
    if ((normA === major && normB === minor) || (normA === minor && normB === major)) {
      return true; // Close enough for fragment matching
    }
  }
  
  return false;
}

/**
 * Calculate how well a chord sequence matches a song
 * Uses a sliding window approach to find the best match
 */
function calculateMatchScore(
  detectedChords: string[],
  songChords: string[]
): { score: number; matchedCount: number } {
  if (detectedChords.length === 0 || songChords.length === 0) {
    return { score: 0, matchedCount: 0 };
  }

  // Normalize all chords
  const detected = detectedChords.map(normalizeChord);
  const song = songChords.map(normalizeChord);

  let bestMatchCount = 0;

  // Sliding window - try to find detected sequence within song
  for (let i = 0; i <= song.length - detected.length; i++) {
    let matchCount = 0;
    for (let j = 0; j < detected.length; j++) {
      if (chordsMatch(detected[j], song[i + j])) {
        matchCount++;
      }
    }
    bestMatchCount = Math.max(bestMatchCount, matchCount);
  }

  // Also check if song chords appear anywhere in detected (for partial songs)
  const uniqueSongChords = [...new Set(song)];
  const uniqueDetectedChords = [...new Set(detected)];
  
  let chordOverlap = 0;
  for (const sc of uniqueSongChords) {
    if (uniqueDetectedChords.some(dc => chordsMatch(dc, sc))) {
      chordOverlap++;
    }
  }

  // Combine sequence match and chord overlap
  const sequenceScore = detected.length > 0 ? bestMatchCount / detected.length : 0;
  const overlapScore = uniqueSongChords.length > 0 ? chordOverlap / uniqueSongChords.length : 0;

  // Weight sequence matching higher than just chord presence
  const finalScore = sequenceScore * 0.7 + overlapScore * 0.3;

  return { 
    score: Math.min(1, finalScore), 
    matchedCount: bestMatchCount 
  };
}

/**
 * Check if detected key matches song key
 */
function keyMatches(detectedKey: string | null, detectedMode: string | null, song: Song): boolean {
  if (!detectedKey) return true; // Don't penalize if no key detected
  
  const normalizedDetected = detectedKey.replace('#', '').replace('b', '');
  const normalizedSong = song.key.replace('#', '').replace('b', '');
  
  // Exact key match
  if (normalizedDetected === normalizedSong && (!detectedMode || detectedMode === song.mode)) {
    return true;
  }
  
  // Relative major/minor (e.g., C major and A minor)
  // This is a simplified check
  return true; // Be lenient with key matching for now
}

/**
 * Find songs that match a sequence of detected chords
 */
export function findMatchingSongs(
  detectedChords: string[],
  detectedKey?: string | null,
  detectedMode?: 'major' | 'minor' | null,
  options?: {
    minScore?: number;
    maxResults?: number;
    difficulty?: Song['difficulty'];
  }
): SongMatch[] {
  const { 
    minScore = 0.3, 
    maxResults = 5,
    difficulty,
  } = options || {};

  if (detectedChords.length < 2) {
    return []; // Need at least 2 chords to match
  }

  const matches: SongMatch[] = [];

  for (const song of SONG_DATABASE) {
    // Filter by difficulty if specified
    if (difficulty && song.difficulty !== difficulty) {
      continue;
    }

    // Check key compatibility
    if (!keyMatches(detectedKey || null, detectedMode || null, song)) {
      continue;
    }

    const { score, matchedCount } = calculateMatchScore(detectedChords, song.chords);

    if (score >= minScore) {
      let confidence: 'high' | 'medium' | 'low' = 'low';
      let reason = '';

      if (score >= 0.7) {
        confidence = 'high';
        reason = `Strong chord progression match (${matchedCount}/${detectedChords.length} chords)`;
      } else if (score >= 0.5) {
        confidence = 'medium';
        reason = `Good chord overlap with ${song.title}`;
      } else {
        reason = `Partial match - similar chords detected`;
      }

      matches.push({
        song,
        score,
        matchedChords: matchedCount,
        totalChords: song.chords.length,
        confidence,
        reason,
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, maxResults);
}

/**
 * Find songs by key (for when we detect key but not enough chords)
 */
export function findSongsByKey(
  key: NoteName,
  mode: 'major' | 'minor',
  options?: {
    maxResults?: number;
    difficulty?: Song['difficulty'];
  }
): Song[] {
  const { maxResults = 5, difficulty } = options || {};

  let songs = SONG_DATABASE.filter(song => {
    const keyMatch = normalizeChord(song.key) === normalizeChord(key);
    const modeMatch = song.mode === mode;
    const difficultyMatch = !difficulty || song.difficulty === difficulty;
    return keyMatch && modeMatch && difficultyMatch;
  });

  // Sort by difficulty (beginner first)
  const difficultyOrder = { beginner: 0, easy: 1, intermediate: 2 };
  songs.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

  return songs.slice(0, maxResults);
}

/**
 * Suggest songs based on detected chords (even partial matches)
 */
export function suggestSongsFromChords(
  detectedChords: string[],
  detectedKey?: string | null,
  detectedMode?: 'major' | 'minor' | null
): {
  matches: SongMatch[];
  suggestions: Song[];
  message: string;
} {
  const matches = findMatchingSongs(detectedChords, detectedKey, detectedMode);

  if (matches.length > 0 && matches[0].confidence === 'high') {
    return {
      matches,
      suggestions: [],
      message: `This sounds like "${matches[0].song.title}"!`,
    };
  }

  if (matches.length > 0) {
    return {
      matches,
      suggestions: [],
      message: `Could be one of these songs...`,
    };
  }

  // No chord matches, but we might have key info
  if (detectedKey && detectedMode) {
    const keySongs = findSongsByKey(detectedKey as NoteName, detectedMode);
    return {
      matches: [],
      suggestions: keySongs,
      message: `Playing in ${detectedKey} ${detectedMode}. Try one of these songs:`,
    };
  }

  return {
    matches: [],
    suggestions: SONG_DATABASE.filter(s => s.difficulty === 'beginner').slice(0, 5),
    message: 'Keep playing! Here are some beginner songs to try:',
  };
}

/**
 * Get the "distance" between chord progressions
 * Used for finding similar songs
 */
export function findSimilarSongs(songId: string, maxResults = 5): Song[] {
  const targetSong = SONG_DATABASE.find(s => s.id === songId);
  if (!targetSong) return [];

  const similarities: { song: Song; score: number }[] = [];

  for (const song of SONG_DATABASE) {
    if (song.id === songId) continue;

    const { score } = calculateMatchScore(targetSong.chords, song.chords);
    
    // Boost score if same key
    const keyBonus = song.key === targetSong.key ? 0.1 : 0;
    const modeBonus = song.mode === targetSong.mode ? 0.05 : 0;

    similarities.push({
      song,
      score: score + keyBonus + modeBonus,
    });
  }

  similarities.sort((a, b) => b.score - a.score);
  return similarities.slice(0, maxResults).map(s => s.song);
}

