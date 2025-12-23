# Allegro - Pivots & Decisions

> **Purpose:** Record key decisions and course corrections
> - Why we chose specific approaches
> - When we changed direction from original plan
> - Append chronologically; never replace

---

## Decision: Break Phase 6 into Sub-Phases - 2025-12-22

**Decision:** Split "Real-Time Play Along" into 3 incremental sub-phases:
- 6A: Key/Mode Detection (simpler first)
- 6B: Real-Time Chord Display
- 6C: Fragment Matching

**Rationale:**
1. Full play-along is a complex feature; smaller milestones reduce risk
2. Key detection alone provides value (parent can noodle in right key)
3. Each sub-phase builds on previous, allowing testing and pivots
4. Matches "build to validate" philosophy

**Alternatives:**
- Build full play-along in one phase (higher risk, longer without feedback)
- Skip directly to fragment matching (harder problem, may not need it)

**Status:** Planned  
**DRI:** JM Beh

---

## Decision: OpenAI gpt-4o-mini for Coaching Content - 2025-12-13

**Decision:** Use OpenAI gpt-4o-mini (not Claude) for coaching content generation

**Rationale:**
1. Cost-effective (~$0.01 per generation)
2. Fast response times
3. 7-day caching reduces API calls significantly
4. Fallback content works when API unavailable
5. OpenAI npm packages already integrated in workspace

**Alternatives:**
- Claude API (higher quality, higher cost)
- Pre-generated content templates (less personalized)
- No AI, just metadata-based suggestions (less engaging)

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Manual Recording Trigger (Not Continuous Listening) - 2025-12-13

**Decision:** Use manual "Start Listening" button instead of continuous background listening

**Rationale:**
1. Lower API costs (only recognize when user intends)
2. Simpler implementation for MVP
3. Clear user intent reduces false positives
4. Battery-friendly for mobile devices
5. Background listening can be added in Phase 7

**Alternatives:**
- Continuous listening (higher API costs, more complex)
- Voice activation ("Hey Allegro") - complex and potentially annoying

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Spotify Client Credentials (Not OAuth) - 2025-12-13

**Decision:** Use Spotify Client Credentials flow instead of user OAuth

**Rationale:**
1. No user login required (lower friction)
2. Sufficient for recommendations endpoint
3. Simpler implementation
4. User doesn't need Spotify account

**Alternatives:**
- Full OAuth (access to user playlists, more features, more complexity)
- Skip Spotify entirely (lose recommendation quality)

**Status:** Implemented  
**DRI:** JM Beh

---

## Pivot: Recognition Challenge with Imperfect Playing - 2025-12-13

**Original:** AudD API would identify songs from live instrument playing

**New:** AudD works well for clean playing but struggles with:
- Start-stop-repeat patterns
- Wrong notes and tempo variations
- Very beginner-level playing

**Trigger:** Real-world testing revealed recognition limitations

**Impact:**
- Scope: Added Phase 6 "Play Along" mode as alternative approach
- Architecture: Need audio analysis beyond song ID (chord/key detection)
- Timeline: Phase 6 now priority focus

**Status:** Documented, Phase 6 planned to address

---

## Decision: Make /play-along a Public Route - 2025-12-22

**Decision:** Added `/play-along` to `PUBLIC_ROUTES` in middleware.ts (no auth required)

**Rationale:**
1. Play Along mode is a standalone feature (doesn't need song history)
2. Lower friction to try the feature
3. Enables easy testing and demos
4. No sensitive data exposed (just real-time audio analysis)
5. Can add auth later if needed for personalization

**Alternatives:**
- Require auth (same as main app) - adds friction for new users
- Separate domain/subdomain (overkill for MVP)

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Use Meyda.js for Key Detection - 2025-12-22

**Decision:** Selected Meyda.js (v5.6.3) for real-time chroma extraction in browser

**Rationale:**
1. Mature library with Web Audio API integration
2. Provides chroma feature (12-element pitch class array)
3. Works in real-time with microphone input
4. Active maintenance (updated April 2024)
5. MIT license, no server-side dependencies

**Alternatives Evaluated:**
- Pitchy (pitch detection only, single notes)
- Aubio.js (less maintained, WASM complexity)
- Essentia.js (more powerful but heavier)

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Template Matching for Chord Detection - 2025-12-22

**Decision:** Use template matching with dot product similarity for chord detection (Phase 6B)

**Rationale:**
1. Builds on existing Meyda.js chroma extraction (no new dependencies)
2. Chord templates are simple to define and extend
3. Works in real-time with minimal computation
4. Good enough for "dad jamming along" use case
5. Alternatives (neural networks, Chordino WASM) are heavier

**Chord Template Approach:**
- Define expected pitch class weights for each chord quality (major, minor, 7th, etc.)
- Rotate template to each root note
- Compare using normalized dot product similarity
- Threshold at ~0.5 for candidate chords

**Alternatives Evaluated:**
- Chordino/NNLS Chroma (WASM binary, complex integration)
- TensorFlow.js chord model (larger bundle, more complex)
- Essentia.js chord extraction (heavier library)

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Chord Mode as Default (vs Key Mode) - 2025-12-22

**Decision:** Made Chord Mode the default on `/play-along` page

**Rationale:**
1. More immediately useful for "jam along" use case
2. Shows guitar diagram right away (visual appeal)
3. Key detection still available via tab switch
4. Chord mode provides more actionable info for guitarists

**Status:** Superseded by Song Mode default (6C)  
**DRI:** JM Beh

---

## Decision: Curated Song Database (Not API) - 2025-12-22

**Decision:** Use a local curated database of ~30 beginner songs instead of an external API

**Rationale:**
1. No API costs or rate limits
2. Songs are specifically curated for beginner practice
3. Can include custom "fun facts" and coaching hooks
4. Faster matching (no network latency)
5. Works offline
6. Full control over song selection and metadata

**Song Categories Included:**
- Nursery/Traditional (Twinkle, Hot Cross Buns, Happy Birthday)
- Classic Rock/Pop (Beatles, Dylan, Oasis)
- Modern Pop (Adele, OneRepublic)
- Classical (Beethoven, Pachelbel)
- Disney/Soundtrack

**Alternatives Considered:**
- MusicBrainz API (massive database, but no chord data)
- External chord databases (accuracy concerns, licensing issues)
- User-contributed songs (moderation overhead)

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Fuzzy Matching Algorithm - 2025-12-22

**Decision:** Implement sliding window + chord overlap matching for song identification

**Algorithm:**
1. Normalize detected chords (enharmonics, simplify extensions)
2. Try sliding window match against each song's chord progression
3. Calculate overlap of unique chords present
4. Combine sequence score (70%) + overlap score (30%)
5. Threshold at 0.3 minimum, high confidence at 0.7+

**Rationale:**
1. Handles imperfect playing (wrong notes, out-of-order)
2. Works with partial progressions (don't need whole song)
3. Computationally simple (no ML model needed)
4. Easy to tune and debug
5. Handles enharmonic equivalents (C# = Db)

**Alternatives Considered:**
- Machine learning model (overkill for 30 songs)
- Edit distance / Levenshtein (too strict for music)
- Audio fingerprinting (doesn't work with imperfect playing)

**Status:** Implemented  
**DRI:** JM Beh

---

## Pivot: Song Mode as New Default - 2025-12-22

**Original:** Chord Mode (6B) was the default on play-along page

**New:** Song Mode (6C) is now the default

**Trigger:** Song identification provides more immediate value ("sounds like...") than just showing chords

**Impact:**
- UX: Users see song matches right away
- Architecture: SongMatcher becomes primary component
- Coaching: Direct link to coaching content when song identified

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Separate Practice Mode Page - 2025-12-22

**Decision:** Create a dedicated `/practice` page for background listening instead of adding another tab to `/play-along`

**Rationale:**
1. Different mental model: Practice Mode is "set and forget", Play Along is interactive
2. Avoids cluttering the play-along page with too many tabs
3. Allows for more prominent session summary display
4. Cleaner separation of concerns
5. Easier to add practice-specific settings later

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Volume-Based Activity Detection - 2025-12-22

**Decision:** Use RMS (root mean square) volume analysis for detecting when music is playing

**Algorithm:**
1. Calculate RMS from frequency data (FFT)
2. Compare against configurable threshold (default: 0.02)
3. Require sustained activity (500ms) before triggering "playing"
4. Require sustained silence (5s) before stopping detection
5. Track peak volume with slow decay for visual feedback

**Rationale:**
1. Simple and computationally efficient
2. Works for any instrument (piano, guitar, voice)
3. Configurable for different environments
4. No ML model needed
5. Low latency response

**Alternatives Considered:**
- Pitch detection (more complex, not needed for activity detection)
- Machine learning (overkill for presence detection)
- Fixed audio level (doesn't adapt to environment)

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Browser Notifications for Song Detection - 2025-12-22

**Decision:** Use Web Notification API for alerting when songs are identified

**Rationale:**
1. No additional dependencies
2. Works across browsers
3. Permission-based (user controls)
4. Persists even when tab is in background
5. Native OS integration

**Constraints:**
- Requires user permission grant
- Some browsers block from insecure contexts
- Mobile browser support varies

**Status:** Implemented  
**DRI:** JM Beh

---

## Decision: Practice Page as Public Route - 2025-12-22

**Decision:** Make `/practice` accessible without authentication (like `/play-along`)

**Rationale:**
1. Consistent with `/play-along` being public
2. Core feature for casual use
3. No sensitive data involved
4. Reduces friction for demo/testing
5. Authentication still available for full app features

**Status:** Implemented  
**DRI:** JM Beh

---

## Notes

- Decisions recorded as they're made
- Review when starting new phases to inform approach
- Link to BUILD_LOG.md for implementation evidence

