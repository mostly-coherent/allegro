/**
 * Chord Detection Module
 * 
 * Phase 6B: Detect individual chords from chroma features
 * Uses template matching against common chord voicings
 */

import { NOTE_NAMES, type NoteName } from './keyDetection';

// Chord quality types
export type ChordQuality = 'major' | 'minor' | '7' | 'maj7' | 'min7' | 'dim' | 'aug' | 'sus4' | 'sus2';

export interface DetectedChord {
  root: NoteName;
  quality: ChordQuality;
  confidence: number;
  displayName: string;
}

export interface ChordDetectionResult {
  chord: DetectedChord | null;
  alternatives: DetectedChord[];
  chroma: number[];
  isListening: boolean;
}

// Chord templates - intervals from root (in semitones)
// Each template is a 12-element array with weights for each pitch class
const CHORD_TEMPLATES: Record<ChordQuality, number[]> = {
  // Major: 1, 3, 5 (0, 4, 7 semitones)
  'major': [1, 0, 0, 0, 0.8, 0, 0, 0.9, 0, 0, 0, 0],
  // Minor: 1, b3, 5 (0, 3, 7 semitones)
  'minor': [1, 0, 0, 0.8, 0, 0, 0, 0.9, 0, 0, 0, 0],
  // Dominant 7: 1, 3, 5, b7 (0, 4, 7, 10 semitones)
  '7': [1, 0, 0, 0, 0.7, 0, 0, 0.8, 0, 0, 0.6, 0],
  // Major 7: 1, 3, 5, 7 (0, 4, 7, 11 semitones)
  'maj7': [1, 0, 0, 0, 0.7, 0, 0, 0.8, 0, 0, 0, 0.6],
  // Minor 7: 1, b3, 5, b7 (0, 3, 7, 10 semitones)
  'min7': [1, 0, 0, 0.7, 0, 0, 0, 0.8, 0, 0, 0.6, 0],
  // Diminished: 1, b3, b5 (0, 3, 6 semitones)
  'dim': [1, 0, 0, 0.8, 0, 0, 0.8, 0, 0, 0, 0, 0],
  // Augmented: 1, 3, #5 (0, 4, 8 semitones)
  'aug': [1, 0, 0, 0, 0.8, 0, 0, 0, 0.8, 0, 0, 0],
  // Sus4: 1, 4, 5 (0, 5, 7 semitones)
  'sus4': [1, 0, 0, 0, 0, 0.8, 0, 0.9, 0, 0, 0, 0],
  // Sus2: 1, 2, 5 (0, 2, 7 semitones)
  'sus2': [1, 0, 0.8, 0, 0, 0, 0, 0.9, 0, 0, 0, 0],
};

// Common qualities to check (in order of likelihood)
const COMMON_QUALITIES: ChordQuality[] = ['major', 'minor', '7', 'min7', 'maj7', 'dim', 'sus4'];

/**
 * Rotate an array by n positions (for transposing chord templates)
 */
function rotateArray<T>(arr: T[], n: number): T[] {
  const len = arr.length;
  const normalized = ((n % len) + len) % len;
  return [...arr.slice(len - normalized), ...arr.slice(0, len - normalized)];
}

/**
 * Calculate dot product similarity between two arrays
 */
function dotProductSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dot = 0;
  let magA = 0;
  let magB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}

/**
 * Format chord name for display
 */
export function formatChordName(root: NoteName, quality: ChordQuality): string {
  const qualitySuffix: Record<ChordQuality, string> = {
    'major': '',
    'minor': 'm',
    '7': '7',
    'maj7': 'maj7',
    'min7': 'm7',
    'dim': 'dim',
    'aug': 'aug',
    'sus4': 'sus4',
    'sus2': 'sus2',
  };
  return `${root}${qualitySuffix[quality]}`;
}

/**
 * Detect chord from chroma features
 */
export function detectChordFromChroma(chroma: number[]): DetectedChord | null {
  if (!chroma || chroma.length !== 12) {
    return null;
  }

  // Check if there's enough signal
  const totalEnergy = chroma.reduce((a, b) => a + b, 0);
  if (totalEnergy < 0.05) {
    return null;
  }

  // Normalize chroma
  const normalizedChroma = chroma.map(c => c / totalEnergy);

  let bestMatch: DetectedChord | null = null;
  let bestScore = 0;
  const alternatives: DetectedChord[] = [];

  // Try all root notes
  for (let rootIndex = 0; rootIndex < 12; rootIndex++) {
    const root = NOTE_NAMES[rootIndex];
    
    // Try common chord qualities
    for (const quality of COMMON_QUALITIES) {
      const template = CHORD_TEMPLATES[quality];
      // Rotate template to match root
      const rotatedTemplate = rotateArray(template, rootIndex);
      
      // Calculate similarity
      const score = dotProductSimilarity(normalizedChroma, rotatedTemplate);
      
      if (score > 0.5) { // Threshold for considering a match
        const chord: DetectedChord = {
          root,
          quality,
          confidence: score,
          displayName: formatChordName(root, quality),
        };
        
        if (score > bestScore) {
          if (bestMatch) {
            alternatives.push(bestMatch);
          }
          bestScore = score;
          bestMatch = chord;
        } else {
          alternatives.push(chord);
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Detect chord with alternatives
 */
export function detectChordWithAlternatives(chroma: number[]): {
  chord: DetectedChord | null;
  alternatives: DetectedChord[];
} {
  if (!chroma || chroma.length !== 12) {
    return { chord: null, alternatives: [] };
  }

  const totalEnergy = chroma.reduce((a, b) => a + b, 0);
  if (totalEnergy < 0.05) {
    return { chord: null, alternatives: [] };
  }

  const normalizedChroma = chroma.map(c => c / totalEnergy);
  const candidates: DetectedChord[] = [];

  // Try all root notes and qualities
  for (let rootIndex = 0; rootIndex < 12; rootIndex++) {
    const root = NOTE_NAMES[rootIndex];
    
    for (const quality of COMMON_QUALITIES) {
      const template = CHORD_TEMPLATES[quality];
      const rotatedTemplate = rotateArray(template, rootIndex);
      const score = dotProductSimilarity(normalizedChroma, rotatedTemplate);
      
      if (score > 0.4) {
        candidates.push({
          root,
          quality,
          confidence: score,
          displayName: formatChordName(root, quality),
        });
      }
    }
  }

  // Sort by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  return {
    chord: candidates[0] || null,
    alternatives: candidates.slice(1, 4), // Top 3 alternatives
  };
}

/**
 * Common chord progressions for "what's next" predictions
 */
export const COMMON_PROGRESSIONS: Record<string, string[][]> = {
  'major': [
    ['I', 'IV', 'V', 'I'],      // Classic
    ['I', 'V', 'vi', 'IV'],     // Pop
    ['I', 'vi', 'IV', 'V'],     // 50s
    ['ii', 'V', 'I'],           // Jazz
    ['I', 'IV', 'I', 'V'],      // Blues
  ],
  'minor': [
    ['i', 'iv', 'V', 'i'],      // Minor classic
    ['i', 'VI', 'III', 'VII'],  // Andalusian
    ['i', 'iv', 'VII', 'III'],  // Pop minor
  ],
};

/**
 * Map numeral to chord in a given key
 */
export function numeralToChord(numeral: string, keyRoot: NoteName, mode: 'major' | 'minor'): string {
  const majorScale = [0, 2, 4, 5, 7, 9, 11]; // W-W-H-W-W-W-H
  const minorScale = [0, 2, 3, 5, 7, 8, 10]; // W-H-W-W-H-W-W
  
  const scale = mode === 'major' ? majorScale : minorScale;
  const rootIndex = NOTE_NAMES.indexOf(keyRoot);
  
  const numeralMap: Record<string, { degree: number; quality: string }> = {
    'I': { degree: 0, quality: '' },
    'ii': { degree: 1, quality: 'm' },
    'iii': { degree: 2, quality: 'm' },
    'IV': { degree: 3, quality: '' },
    'V': { degree: 4, quality: '' },
    'vi': { degree: 5, quality: 'm' },
    'vii°': { degree: 6, quality: 'dim' },
    'i': { degree: 0, quality: 'm' },
    'iv': { degree: 3, quality: 'm' },
    'III': { degree: 2, quality: '' },
    'VI': { degree: 5, quality: '' },
    'VII': { degree: 6, quality: '' },
  };
  
  const info = numeralMap[numeral];
  if (!info) return numeral;
  
  const noteIndex = (rootIndex + scale[info.degree]) % 12;
  return `${NOTE_NAMES[noteIndex]}${info.quality}`;
}

/**
 * Predict next chord based on current chord and key
 */
export function predictNextChords(
  currentChord: string,
  keyRoot: NoteName,
  mode: 'major' | 'minor'
): string[] {
  const predictions: string[] = [];
  const progressions = COMMON_PROGRESSIONS[mode] || [];
  
  // Find current chord in progressions and suggest next
  for (const progression of progressions) {
    for (let i = 0; i < progression.length - 1; i++) {
      const chordInKey = numeralToChord(progression[i], keyRoot, mode);
      if (chordInKey === currentChord || chordInKey.replace('m', '') === currentChord.replace('m', '')) {
        const nextNumeral = progression[i + 1];
        const nextChord = numeralToChord(nextNumeral, keyRoot, mode);
        if (!predictions.includes(nextChord)) {
          predictions.push(nextChord);
        }
      }
    }
  }
  
  return predictions.slice(0, 3); // Top 3 predictions
}

