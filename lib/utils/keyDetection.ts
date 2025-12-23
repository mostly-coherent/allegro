/**
 * Key Detection Module
 * 
 * Uses Meyda.js chroma feature extraction + Krumhansl-Schmuckler algorithm
 * to detect the musical key from real-time audio.
 * 
 * Phase 6A: Simple key/mode detection so parent can noodle along
 */

// Note names for display
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type NoteName = typeof NOTE_NAMES[number];

// Major and minor key profiles (Krumhansl-Schmuckler)
// These represent the expected distribution of pitch classes for each key
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export interface DetectedKey {
  key: NoteName;
  mode: 'major' | 'minor';
  confidence: number; // 0-1, how confident we are
  alternateKey?: {
    key: NoteName;
    mode: 'major' | 'minor';
    confidence: number;
  };
}

export interface KeyDetectionResult {
  detectedKey: DetectedKey | null;
  chroma: number[];
  isListening: boolean;
  sampleCount: number;
  error?: string;
}

// Common chord progressions for each key (for "suggested chords" feature)
export const KEY_CHORDS: Record<string, string[]> = {
  'C major': ['C', 'Dm', 'Em', 'F', 'G', 'Am'],
  'G major': ['G', 'Am', 'Bm', 'C', 'D', 'Em'],
  'D major': ['D', 'Em', 'F#m', 'G', 'A', 'Bm'],
  'A major': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m'],
  'E major': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m'],
  'F major': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm'],
  'Bb major': ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm'],
  'A minor': ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
  'E minor': ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'],
  'D minor': ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'],
  'B minor': ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'],
  'G minor': ['Gm', 'Adim', 'Bb', 'Cm', 'Dm', 'Eb', 'F'],
};

/**
 * Rotate an array by n positions (for transposing key profiles)
 */
function rotateArray<T>(arr: T[], n: number): T[] {
  const len = arr.length;
  const normalized = ((n % len) + len) % len;
  return [...arr.slice(normalized), ...arr.slice(0, normalized)];
}

/**
 * Calculate Pearson correlation between two arrays
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Detect key from chroma features using Krumhansl-Schmuckler algorithm
 */
export function detectKeyFromChroma(chroma: number[]): DetectedKey | null {
  if (!chroma || chroma.length !== 12) {
    return null;
  }

  // Check if there's enough signal (not just silence)
  const totalEnergy = chroma.reduce((a, b) => a + b, 0);
  if (totalEnergy < 0.01) {
    return null;
  }

  // Normalize chroma
  const normalizedChroma = chroma.map(c => c / totalEnergy);

  let bestCorrelation = -Infinity;
  let bestKey = 0;
  let bestMode: 'major' | 'minor' = 'major';
  let secondBestCorrelation = -Infinity;
  let secondBestKey = 0;
  let secondBestMode: 'major' | 'minor' = 'major';

  // Try all 12 major keys
  for (let i = 0; i < 12; i++) {
    const rotatedProfile = rotateArray(MAJOR_PROFILE, i);
    const correlation = pearsonCorrelation(normalizedChroma, rotatedProfile);
    
    if (correlation > bestCorrelation) {
      secondBestCorrelation = bestCorrelation;
      secondBestKey = bestKey;
      secondBestMode = bestMode;
      bestCorrelation = correlation;
      bestKey = i;
      bestMode = 'major';
    } else if (correlation > secondBestCorrelation) {
      secondBestCorrelation = correlation;
      secondBestKey = i;
      secondBestMode = 'major';
    }
  }

  // Try all 12 minor keys
  for (let i = 0; i < 12; i++) {
    const rotatedProfile = rotateArray(MINOR_PROFILE, i);
    const correlation = pearsonCorrelation(normalizedChroma, rotatedProfile);
    
    if (correlation > bestCorrelation) {
      secondBestCorrelation = bestCorrelation;
      secondBestKey = bestKey;
      secondBestMode = bestMode;
      bestCorrelation = correlation;
      bestKey = i;
      bestMode = 'minor';
    } else if (correlation > secondBestCorrelation) {
      secondBestCorrelation = correlation;
      secondBestKey = i;
      secondBestMode = 'minor';
    }
  }

  // Convert correlation to confidence (0-1 scale)
  // Correlation ranges from -1 to 1, so we map it
  const confidence = Math.max(0, Math.min(1, (bestCorrelation + 1) / 2));
  const secondConfidence = Math.max(0, Math.min(1, (secondBestCorrelation + 1) / 2));

  return {
    key: NOTE_NAMES[bestKey],
    mode: bestMode,
    confidence,
    alternateKey: secondConfidence > 0.3 ? {
      key: NOTE_NAMES[secondBestKey],
      mode: secondBestMode,
      confidence: secondConfidence,
    } : undefined,
  };
}

/**
 * Get suggested chords for a detected key
 */
export function getSuggestedChords(detectedKey: DetectedKey): string[] {
  const keyString = `${detectedKey.key} ${detectedKey.mode}`;
  return KEY_CHORDS[keyString] || [];
}

/**
 * Format key for display
 */
export function formatKey(detectedKey: DetectedKey): string {
  return `${detectedKey.key} ${detectedKey.mode}`;
}

/**
 * Get enharmonic equivalent (e.g., C# = Db)
 */
export function getEnharmonic(note: NoteName): string | null {
  const enharmonics: Record<string, string> = {
    'C#': 'Db',
    'D#': 'Eb',
    'F#': 'Gb',
    'G#': 'Ab',
    'A#': 'Bb',
  };
  return enharmonics[note] || null;
}

