'use client';

/**
 * ChordDiagram Component
 * 
 * Phase 6B: SVG-based guitar chord diagram
 * Shows fingering positions for common chords
 */

import { memo } from 'react';

interface ChordDiagramProps {
  chord: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

// Chord fingering data: [E, A, D, G, B, e] strings
// -1 = don't play (x), 0 = open string (o), 1-12 = fret number
interface ChordFingering {
  frets: number[];
  fingers?: number[]; // Which finger to use (1-4)
  barreInfo?: { fret: number; fromString: number; toString: number };
  baseFret?: number; // For chords not at the nut
}

// Common guitar chord voicings
const CHORD_DATA: Record<string, ChordFingering> = {
  // Major chords
  'C': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'D': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'F': { frets: [1, 3, 3, 2, 1, 1], barreInfo: { fret: 1, fromString: 0, toString: 5 } },
  'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'B': { frets: [-1, 2, 4, 4, 4, 2], baseFret: 2, barreInfo: { fret: 2, fromString: 1, toString: 5 } },
  
  // Minor chords
  'Am': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'Bm': { frets: [-1, 2, 4, 4, 3, 2], baseFret: 2, barreInfo: { fret: 2, fromString: 1, toString: 5 } },
  'Cm': { frets: [-1, 3, 5, 5, 4, 3], baseFret: 3, barreInfo: { fret: 3, fromString: 1, toString: 5 } },
  'Dm': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'Fm': { frets: [1, 3, 3, 1, 1, 1], barreInfo: { fret: 1, fromString: 0, toString: 5 } },
  'Gm': { frets: [3, 5, 5, 3, 3, 3], baseFret: 3, barreInfo: { fret: 3, fromString: 0, toString: 5 } },
  
  // 7th chords
  'A7': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0] },
  'B7': { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
  'C7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  'D7': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'E7': { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'G7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  
  // Minor 7th chords
  'Am7': { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  'Bm7': { frets: [-1, 2, 4, 2, 3, 2], baseFret: 2 },
  'Dm7': { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  'Em7': { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0] },
  
  // Maj7 chords
  'Cmaj7': { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'Dmaj7': { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1] },
  'Fmaj7': { frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  'Gmaj7': { frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3] },
  
  // Sus chords
  'Asus4': { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Dsus4': { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3] },
  'Esus4': { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 1, 2, 3, 0, 0] },
  
  // Dim chords
  'Bdim': { frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0] },
  'C#dim': { frets: [-1, 4, 5, 3, 5, -1], baseFret: 3 },
  'F#dim': { frets: [-1, -1, 4, 2, 1, 2], fingers: [0, 0, 4, 2, 1, 3] },
};

// Map sharp notes to their chord data (use enharmonic equivalents)
const ENHARMONIC_MAP: Record<string, string> = {
  'C#': 'C#', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'Eb',
  'F#': 'F#', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'Ab',
  'A#': 'Bb', 'Bb': 'Bb',
};

function getChordData(chord: string): ChordFingering | null {
  // Direct lookup
  if (CHORD_DATA[chord]) {
    return CHORD_DATA[chord];
  }
  
  // Try with enharmonic equivalent
  for (const [sharp, flat] of Object.entries(ENHARMONIC_MAP)) {
    if (chord.startsWith(sharp)) {
      const altChord = chord.replace(sharp, flat);
      if (CHORD_DATA[altChord]) {
        return CHORD_DATA[altChord];
      }
    }
  }
  
  return null;
}

const SIZES = {
  sm: { width: 60, height: 80, fontSize: 8, dotSize: 4 },
  md: { width: 100, height: 130, fontSize: 12, dotSize: 6 },
  lg: { width: 140, height: 180, fontSize: 16, dotSize: 8 },
};

export const ChordDiagram = memo(function ChordDiagram({ 
  chord, 
  size = 'md',
  showName = true 
}: ChordDiagramProps) {
  const chordData = getChordData(chord);
  const dimensions = SIZES[size];
  
  if (!chordData) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-100 rounded-lg text-slate-400"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <span style={{ fontSize: dimensions.fontSize }}>?</span>
      </div>
    );
  }

  const { frets, barreInfo, baseFret = 1 } = chordData;
  
  // Calculate diagram dimensions
  const padding = 10;
  const nutHeight = 4;
  const stringSpacing = (dimensions.width - padding * 2) / 5;
  const fretSpacing = (dimensions.height - padding * 2 - (showName ? 20 : 0) - nutHeight) / 4;
  const startY = padding + (showName ? 20 : 0);
  
  // Find the fret range to display
  const playedFrets = frets.filter(f => f > 0);
  const minFret = Math.min(...playedFrets, baseFret);
  const displayBaseFret = minFret > 1 ? minFret : 1;

  return (
    <svg 
      width={dimensions.width} 
      height={dimensions.height}
      className="chord-diagram"
      role="img"
      aria-label={`Guitar chord diagram for ${chord}`}
    >
      {/* Chord name */}
      {showName && (
        <text
          x={dimensions.width / 2}
          y={14}
          textAnchor="middle"
          className="fill-slate-900 font-bold"
          style={{ fontSize: dimensions.fontSize }}
        >
          {chord}
        </text>
      )}
      
      {/* Nut (thick line at top if at first position) */}
      {displayBaseFret === 1 && (
        <rect
          x={padding}
          y={startY}
          width={dimensions.width - padding * 2}
          height={nutHeight}
          className="fill-slate-800"
        />
      )}
      
      {/* Base fret indicator (if not at nut) */}
      {displayBaseFret > 1 && (
        <text
          x={padding - 2}
          y={startY + fretSpacing / 2 + 4}
          textAnchor="end"
          className="fill-slate-600"
          style={{ fontSize: dimensions.fontSize - 2 }}
        >
          {displayBaseFret}
        </text>
      )}
      
      {/* Fret lines */}
      {[0, 1, 2, 3, 4].map(fret => (
        <line
          key={`fret-${fret}`}
          x1={padding}
          y1={startY + nutHeight + fret * fretSpacing}
          x2={dimensions.width - padding}
          y2={startY + nutHeight + fret * fretSpacing}
          className="stroke-slate-300"
          strokeWidth={1}
        />
      ))}
      
      {/* Strings */}
      {[0, 1, 2, 3, 4, 5].map(string => (
        <line
          key={`string-${string}`}
          x1={padding + string * stringSpacing}
          y1={startY + nutHeight}
          x2={padding + string * stringSpacing}
          y2={startY + nutHeight + 4 * fretSpacing}
          className="stroke-slate-400"
          strokeWidth={1}
        />
      ))}
      
      {/* Barre (if applicable) */}
      {barreInfo && (
        <rect
          x={padding + barreInfo.fromString * stringSpacing - dimensions.dotSize / 2}
          y={startY + nutHeight + (barreInfo.fret - displayBaseFret + 0.5) * fretSpacing - dimensions.dotSize / 2}
          width={(barreInfo.toString - barreInfo.fromString) * stringSpacing + dimensions.dotSize}
          height={dimensions.dotSize}
          rx={dimensions.dotSize / 2}
          className="fill-slate-700"
        />
      )}
      
      {/* Finger positions */}
      {frets.map((fret, string) => {
        const x = padding + string * stringSpacing;
        
        if (fret === -1) {
          // X for muted string
          return (
            <text
              key={`pos-${string}`}
              x={x}
              y={startY - 2}
              textAnchor="middle"
              className="fill-slate-500"
              style={{ fontSize: dimensions.fontSize - 2 }}
            >
              ×
            </text>
          );
        }
        
        if (fret === 0) {
          // O for open string
          return (
            <circle
              key={`pos-${string}`}
              cx={x}
              cy={startY - 4}
              r={dimensions.dotSize / 2}
              className="fill-none stroke-slate-500"
              strokeWidth={1.5}
            />
          );
        }
        
        // Filled dot for fretted position
        const displayFret = fret - displayBaseFret + 1;
        if (displayFret > 0 && displayFret <= 4) {
          return (
            <circle
              key={`pos-${string}`}
              cx={x}
              cy={startY + nutHeight + (displayFret - 0.5) * fretSpacing}
              r={dimensions.dotSize}
              className="fill-slate-700"
            />
          );
        }
        
        return null;
      })}
    </svg>
  );
});

export default ChordDiagram;

