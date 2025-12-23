# Allegro - Build Log

> **Purpose:** Chronological progress diary
> - Track what was done, when, and evidence of completion
> - Append entries (never replace); date each entry

---

## Progress - 2025-12-22 (Phase 7)

**Done:**
- ✅ **Phase 7: Background Listening Mode - COMPLETE**
  - Created `lib/hooks/useActivityDetector.ts` - Activity detection
    - Volume-based detection using RMS calculation
    - Configurable thresholds for activity vs silence
    - Automatic silence timeout detection
    - Peak volume tracking
  - Created `lib/hooks/useSessionHistory.ts` - Session tracking
    - Queue of session events (songs, chords, keys)
    - Session statistics calculation
    - Timeline of practice activities
  - Created `components/BackgroundListener.tsx` - Main auto-listening
    - Integrates activity detection with chord detection
    - Automatic song identification when playing detected
    - Browser notification support
    - Real-time status display
    - Session stats (songs detected, chords played, current key)
  - Created `components/SessionSummary.tsx` - Session review
    - Practice session statistics grid
    - Songs practiced with play counts
    - Most played chords with diagrams
    - Session timeline with key events
    - Encouragement messages
  - Created `app/practice/page.tsx` - Practice Mode page
    - Dedicated page for background listening
    - How-it-works explainer
    - Navigation to/from Play Along mode
    - Battery usage notice
  - Updated middleware to make `/practice` public route
  - Added E2E test for Practice Mode page

**Testing:**
- ✅ Build passes (`npm run build` - 8 routes generated)
- ✅ All 7 E2E tests pass
- ✅ No TypeScript/linter errors

**Phase 7 Complete! 🎉**
- 7A: Activity Detection ✅
- 7B: Session Queue & Summary ✅
- 7C: Notifications ✅

**Next:**
- Manual testing with real practice sessions
- Consider Phase 8 (Practice Tracking & Progress)

---

## Progress - 2025-12-22 (Phase 6C)

**Done:**
- ✅ **Phase 6C: Fragment Matching - COMPLETE**
  - Created `lib/data/songDatabase.ts` - Curated song database
    - 30+ beginner-friendly songs with chord progressions
    - Includes difficulty levels (beginner, easy, intermediate)
    - Fun facts and coaching hooks for each song
    - Categories: nursery, classic rock, pop, folk, classical, disney
  - Created `lib/utils/fragmentMatcher.ts` - Fuzzy matching algorithm
    - Sliding window chord sequence matching
    - Enharmonic normalization (C# = Db)
    - Relative major/minor tolerance
    - Chord simplification (maj7 → major, m7 → m)
    - "Next chord" predictions based on common progressions
  - Created `components/SongMatcher.tsx` - Song identification UI
    - Real-time chord detection feeding into song matching
    - Confidence scoring (high/medium/low)
    - Song details panel with chord diagrams
    - Similar song recommendations
    - Fun facts display
  - Updated `app/play-along/page.tsx` - Three-mode UI
    - Song Mode (6C): Identify songs from playing - NEW DEFAULT
    - Chord Mode (6B): Real-time chord detection
    - Key Mode (6A): Overall key detection
    - Coaching link when song is confidently identified
  - Updated E2E tests for new Song Mode default

**Testing:**
- ✅ Build passes (`npm run build` - 12.6 kB for play-along)
- ✅ All 6 E2E tests pass
- ✅ No TypeScript/linter errors

**Phase 6 Complete! 🎉**
- 6A: Key/Mode Detection ✅
- 6B: Real-Time Chord Display ✅
- 6C: Fragment Matching ✅

**Next:**
- Manual testing with real practice sessions
- Fine-tune matching thresholds based on real-world use
- Consider Phase 7 (Background Listening Mode)

---

## Progress - 2025-12-22 (Phase 6B)

**Done:**
- ✅ **Phase 6B: Real-Time Chord Display - COMPLETE**
  - Created `lib/utils/chordDetection.ts` - Template matching algorithm
    - Chord templates for major, minor, 7th, maj7, min7, dim, sus chords
    - Dot product similarity for chord matching
    - Common progression predictions (I-IV-V, pop, jazz patterns)
  - Created `components/ChordDiagram.tsx` - SVG guitar diagrams
    - 30+ chord fingerings (C, D, E, F, G, A, B + variations)
    - Major, minor, 7th, maj7, min7, dim, sus4 voicings
    - Barre chord support
  - Created `lib/hooks/useChordDetector.ts` - Real-time chord detection hook
    - Extends Meyda chroma extraction for chord ID
    - Chord history tracking with timestamps
    - "Next chord" prediction based on key + progressions
  - Created `components/ChordDetector.tsx` - Full chord detection UI
    - Large chord display with diagram
    - Alternative chord suggestions
    - Chord progression history
    - Key context with predictions
  - Updated `app/play-along/page.tsx` - Mode tabs
    - Chord Mode (6B): Real-time chord + diagram
    - Key Mode (6A): Overall key detection
    - Context-aware tips for each mode

**Testing:**
- ✅ Build passes (`npm run build` - 7 routes generated)
- ✅ No TypeScript/linter errors
- ⏳ Manual testing with instruments pending

**Next:**
- Test with real practice sessions
- Fine-tune chord confidence thresholds
- Consider Phase 6C (fragment matching)

---

## Progress - 2025-12-22 (Phase 6A)

**Done:**
- ✅ Updated Plan.md to reflect actual state (Phases 1-5 complete)
- ✅ Updated BUILD_SUMMARY.md to v1.0.0 status
- ✅ Created BUILD_LOG.md (this file) for ongoing progress tracking
- ✅ Created PIVOTS.md for decision/pivot logging
- ✅ Broke Phase 6 into sensible sub-phases (6A, 6B, 6C)
- ✅ **Phase 6A Implementation:**
  - Researched browser audio libraries (Meyda.js, Pitchy, Aubio.js)
  - Selected Meyda.js for chroma feature extraction
  - Implemented Krumhansl-Schmuckler key detection algorithm
  - Created `lib/utils/keyDetection.ts` - core detection logic
  - Created `lib/hooks/useKeyDetector.ts` - React hook with real-time Meyda integration
  - Created `components/KeyDetector.tsx` - UI component with chroma visualization
  - Created `app/play-along/page.tsx` - dedicated Play Along Mode page
  - Added link to Play Along from main page
  - Installed meyda package (v5.6.3)

**Completed Testing:**
- ✅ Build passes
- ✅ All 6 E2E tests pass (including new Play Along test)
- ✅ `/play-along` page accessible without auth (added to PUBLIC_ROUTES)

---

## Progress - 2025-12-13 (Historical)

**Done (Phases 1-5):**
- ✅ Phase 1: Core recognition with AudD API
- ✅ Phase 2: Metadata enrichment (MusicBrainz + Wikipedia)
- ✅ Phase 3: Spotify recommendations with audio previews
- ✅ Phase 4: AI coaching content (OpenAI gpt-4o-mini)
- ✅ Phase 5: Production deployment to Vercel

**Evidence:**
- Deployed: github.com/mostly-coherent/allegro → Vercel
- E2E tests passing (5 specs, screenshots in `e2e-results/`)
- API routes: `/api/recognize`, `/api/metadata`, `/api/recommendations`, `/api/coaching`

---

## Notes

- Phases 1-5 were built rapidly; this log created retroactively
- BUILD_SUMMARY.md contains detailed feature list from initial build
- Going forward, update this log as work progresses on Phase 6+

