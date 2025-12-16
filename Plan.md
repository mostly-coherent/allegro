# Allegro - Product Requirements & Implementation Plan

> *Allegro* (Italian): Cheerful, lively - Bringing joy and energy to music practice

## Product Vision

A personal coaching companion app that listens to kids practicing piano and guitar at home, identifies what they're playing, and provides parents with conversation starters, fun facts, and coaching moments to engage meaningfully with their children's music practice.

**Core Insight:** Turn passive listening into active engagement - help parents who aren't music experts connect with their kids' practice sessions through smart, contextual information.

## Primary Use Case

**The Scenario:** Kids practicing piano/guitar behind your desk at home. You hear them playing but may not recognize the piece or know how to engage meaningfully.

**The Solution:** App running on your phone/computer listens via microphone, identifies the music, and suggests:
- Wise cracks and conversation starters
- Coaching moments and encouragement
- Fun facts about the song/composer
- Similar pieces they might enjoy learning next

## Target Users

**Primary:** Parents of children learning instruments (ages 5-18)
- Want to support their kids' music education
- May not have formal music training themselves
- Looking for ways to engage during practice sessions
- Want to encourage without being overbearing

**Secondary:** Music teachers and tutors
- Can use during lessons to provide context
- Helps explain musical connections and history

## Core Features

### 1. Real-time Music Recognition (Background Listening)
**User Story:** As a parent, I want the app to automatically listen and identify what my kids are playing so I can stay informed without interrupting their practice.

**Requirements:**
- Continuous background listening mode (while app is open)
- Automatic detection when music starts playing
- 5-10 second audio sample capture
- Real-time song identification
- Handle live instrument performances (not just recordings)
- Work with imperfect playing (wrong notes, tempo variations)
- Minimal UI distraction (can run in background)

**Technical Approach:**
- Use `navigator.mediaDevices.getUserMedia()` for microphone access
- Detect audio activity threshold to trigger recognition
- Capture audio in browser using Web Audio API
- Send audio samples to AudD API for identification
- Display subtle notification when song is identified
- Queue multiple identifications during practice session

### 2. Song Information Display
**User Story:** As a user, I want to see comprehensive information about the identified song so I can learn about its origins.

**Requirements:**
- Song title and artist
- Songwriter/composer credits
- Album information
- Release date
- Genre/style

**Technical Approach:**
- Primary: AudD API response
- Fallback: MusicBrainz API for additional metadata
- Cache results to reduce API calls

### 3. Songwriter/Composer Fun Facts
**User Story:** As a user, I want to learn interesting facts about the songwriter so I can have engaging conversations about the music.

**Requirements:**
- Biographical information
- Notable achievements
- Interesting trivia
- Historical context
- Related artists/collaborations

**Technical Approach:**
- Wikipedia API for biographical data
- Genius API for music-specific context
- Optional: OpenAI/Claude API to synthesize conversation starters from raw data

### 4. "What's Next" Recommendations
**User Story:** As a parent, I want to suggest similar pieces my kids might enjoy learning next, based on what they're currently playing.

**Requirements:**
- 3-5 similar piece recommendations
- Difficulty level indicators (beginner, intermediate, advanced)
- Why it's similar (same composer, same era, same style)
- Learning progression logic (slightly harder or same level)
- Genre-appropriate (classical, pop, rock, etc.)

**Technical Approach:**
- Spotify Web API `/recommendations` endpoint for popular music
- MusicBrainz for classical music relationships
- Filter by difficulty level (if metadata available)
- Display with reasoning ("Similar tempo and key signature")
- Optional: Track what they've already played to avoid duplicates

### 5. Wise Cracks & Coaching Moments
**User Story:** As a parent, I want smart suggestions for how to engage with my kids about what they're playing - both fun comments and genuine coaching opportunities.

**Requirements:**
- **Wise Cracks:** Light, fun comments to break the ice ("Did you know this was written in a coffee shop?")
- **Coaching Moments:** Constructive engagement ("This piece has a tricky tempo change at measure 32 - listen for it!")
- **Encouragement Prompts:** Positive reinforcement ideas ("This is one of Mozart's most challenging pieces for beginners!")
- **Context Sharing:** Historical/cultural background to spark interest
- Age-appropriate tone (adjust for elementary vs. high school)
- Non-intrusive delivery (parent can choose when to engage)

**Technical Approach:**
- Generate from metadata (Wikipedia + Genius + MusicBrainz)
- Use LLM (OpenAI/Claude) to create contextual, personalized prompts
- Template categories:
  - Fun facts and trivia
  - Technical coaching points
  - Historical context
  - "What's next" suggestions (similar pieces to learn)
  - Encouragement and milestone recognition
- Cache generated prompts per song to reduce API costs

## API Architecture

### Required APIs

#### 1. Music Recognition - AudD API
**Purpose:** Identify songs from audio
**Pricing:** $2-5 per 1,000 requests (300 free)
**Rate Limits:** Check current limits
**Fallback:** ACRCloud or ShazamKit (iOS only)

#### 2. Metadata - MusicBrainz API
**Purpose:** Songwriter/composer credits
**Pricing:** Free (rate limited)
**Rate Limits:** ~1 req/sec (can request higher)
**Fallback:** Spotify API for basic metadata

#### 3. Recommendations - Spotify Web API
**Purpose:** Similar tracks
**Pricing:** Free (OAuth required)
**Rate Limits:** Standard OAuth limits
**Fallback:** Last.fm API

#### 4. Fun Facts - Wikipedia API
**Purpose:** Biographical information
**Pricing:** Free
**Rate Limits:** Reasonable use
**Fallback:** Genius API

#### 5. Context - Genius API (Optional)
**Purpose:** Song-specific stories and annotations
**Pricing:** Free (API key required)
**Rate Limits:** Check current limits

#### 6. AI Enhancement - OpenAI/Anthropic (Recommended)
**Purpose:** Generate personalized wise cracks, coaching moments, and conversation starters
**Pricing:** Pay-per-use (~$0.01-0.10 per generation)
**Usage:** Primary method for creating contextual, age-appropriate coaching content
**Prompt Strategy:**
- Input: Song metadata + child age/skill level + practice context
- Output: 3 wise cracks, 2 coaching moments, 2 encouragement prompts
- Cache generated content per song to reduce costs

## Implementation Phases

### Phase 1: MVP - Core Recognition (Week 1-2) ✅ COMPLETE
**Goal:** Identify what kids are playing and display basic information

**Tasks:**
- [x] Set up Next.js project with TypeScript
- [x] Implement microphone capture component (manual trigger button)
- [x] Integrate AudD API for song recognition
- [x] Display song title, artist/composer, album
- [x] Handle "not found" cases gracefully
- [x] Basic error handling and loading states
- [x] Mobile-responsive UI (phone + desktop)
- [ ] Test with live piano/guitar recordings (pending API key)

**Success Criteria:**
- ✅ Can identify songs from live instrument playing
- ✅ Displays basic song information clearly
- ✅ Works on desktop (near desk) and mobile (phone)
- ✅ Handles errors gracefully with helpful tips

### Phase 2: Metadata Enrichment (Week 3) ✅ COMPLETE
**Goal:** Add songwriter information and fun facts

**Tasks:**
- [x] Integrate MusicBrainz API
- [x] Fetch songwriter/composer credits
- [x] Integrate Wikipedia API
- [x] Parse and display biographical information
- [x] Create fun facts display component
- [x] Implement data caching

**Success Criteria:**
- ✅ Shows songwriter/composer credits
- ✅ Displays 2-5 fun facts per song
- ✅ Caches data to reduce API calls (1 hour cache)

### Phase 3: Recommendations (Week 4) ✅ COMPLETE
**Goal:** Add similar songs feature

**Tasks:**
- [x] Set up Spotify Client Credentials flow (no user login required)
- [x] Integrate Spotify recommendations endpoint
- [x] Display similar songs with album art
- [x] Add audio preview playback (30-second previews)
- [x] Implement recommendation grid (responsive 2-5 columns)

**Success Criteria:**
- ✅ Shows 5 similar songs
- ✅ Displays album art and metadata
- ✅ Audio preview on hover/click
- ✅ 24-hour caching for performance

### Phase 4: Wise Cracks & Coaching Moments (Week 5) ✅ COMPLETE
**Goal:** Generate personalized engagement suggestions for parents

**Tasks:**
- [x] Integrate OpenAI API for content generation (gpt-4o-mini)
- [x] Create prompt templates for different content types:
  - Wise cracks (fun, light)
  - Coaching moments (constructive)
  - Encouragement prompts (positive)
  - "What's next" suggestions
- [x] Add age/skill level selector (5-18+ with beginner/intermediate/advanced)
- [x] Display categorized prompts with icons and colored cards
- [x] Add copy-to-clipboard functionality (hover to reveal, click to copy)
- [x] Implement 7-day caching to reduce API costs
- [x] Fallback content when OpenAI not configured

**Success Criteria:**
- ✅ Shows 3 wise cracks, 2 coaching moments, 2 encouragement prompts per song
- ✅ Age-appropriate tone based on user settings
- ✅ Engaging, contextual, and personalized to the specific song
- ✅ Easy to copy and use in conversation

### Phase 5: Polish & Optimization (Week 6)
**Goal:** Production-ready app

**Tasks:**
- [ ] Implement comprehensive error handling
- [ ] Add rate limiting and API call optimization
- [ ] Improve loading states and animations
- [ ] Add analytics (optional)
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Deploy to Vercel
- [ ] Create demo video/screenshots

**Success Criteria:**
- Handles all error cases gracefully
- Fast and responsive
- Production-ready deployment

## Technical Architecture

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React hooks (useState, useContext)
- **Audio:** Web Audio API

### Backend
- **API Routes:** Next.js API routes for server-side API calls
- **Caching:** In-memory cache or Redis (for production)
- **Rate Limiting:** Implement per-user rate limits

### Deployment
- **Hosting:** Vercel
- **Environment:** Production + Preview environments
- **Domain:** TBD

## Data Flow

```
User → Microphone Permission → Audio Capture (5-10s)
  → Send to AudD API → Song Identified
  → Parallel API Calls:
     1. MusicBrainz (songwriter/composer)
     2. Wikipedia (fun facts)
     3. Spotify (similar songs)
     4. Genius (optional context)
  → Display Results
```

## Privacy & Security

- **Microphone Access:** Request permission, explain usage
- **Audio Data:** Process client-side, only send to AudD API
- **No Storage:** Don't store audio recordings
- **API Keys:** Server-side only (Next.js API routes)
- **User Data:** No user accounts required (optional for future)

## Cost Estimates

### Monthly (1,000 identifications)
- AudD API: $2-5
- MusicBrainz: Free
- Spotify: Free (OAuth)
- Wikipedia: Free
- Genius: Free
- OpenAI (optional): $10-50

**Total:** $2-55/month depending on usage and AI enhancement

### Scaling (10,000 identifications/month)
- AudD API: $20-50
- Other APIs: Free
- OpenAI (optional): $100-500

**Total:** $20-550/month

## Success Metrics

### Technical Performance
- **Recognition Accuracy:** >80% for live instrument performances (lower bar than recordings)
- **Response Time:** <5 seconds for full results (identification + coaching content)
- **API Cost:** <$0.10 per identification (including AI generation)

### User Engagement
- **Parent Usage:** Used during 50%+ of practice sessions
- **Conversation Rate:** Parent engages with child based on app suggestions 30%+ of the time
- **Session Length:** App runs in background for entire practice session (15-30 min avg)
- **Repeat Usage:** Used 3+ times per week

### Qualitative Goals
- Parents feel more confident engaging with kids' music practice
- Kids feel encouraged and supported (not criticized)
- App doesn't interrupt or distract from practice
- Suggestions feel natural and helpful, not forced

## Future Enhancements (Post-MVP)

### Practice Tracking & Progress
- [ ] Practice session history (what was played, when, for how long)
- [ ] Progress visualization (pieces mastered over time)
- [ ] Practice streak tracking and gamification
- [ ] Multi-child profiles with separate histories

### Enhanced Coaching
- [ ] Skill level detection (analyze playing quality)
- [ ] Tempo and rhythm analysis (are they rushing/dragging?)
- [ ] Suggest specific technique improvements
- [ ] Integration with music lesson plans

### Social & Sharing
- [ ] Share practice milestones with family
- [ ] Connect with music teachers for progress reports
- [ ] Virtual recital recordings
- [ ] Parent community for tips and encouragement

### Content & Learning
- [ ] Sheet music integration (show what they're playing)
- [ ] Video tutorials for identified pieces
- [ ] Classical music and composer deep dives
- [ ] Music theory explanations tailored to current piece

### Technical Improvements
- [ ] Offline mode with cached data
- [ ] Multiple language support
- [ ] Better handling of imperfect playing
- [ ] Instrument-specific recognition tuning
- [ ] Background noise filtering

## Open Questions

1. **Listening Mode:** Continuous background listening vs. manual trigger button?
   - Continuous = more convenient, higher API costs
   - Manual = lower costs, requires parent to remember to trigger
   - **Recommendation:** Start with manual, add continuous as premium feature

2. **Recognition Accuracy:** How to handle imperfect playing (wrong notes, tempo issues)?
   - AudD may struggle with beginner performances
   - May need to adjust audio processing or use longer samples
   - Consider adding "manual search" fallback

3. **Practice Session Tracking:** Should we track practice history?
   - Useful for seeing progress over time
   - Requires user accounts and data storage
   - Privacy considerations for kids' data
   - **Recommendation:** Phase 2 feature, optional opt-in

4. **Multi-Child Support:** How to distinguish between different kids playing?
   - Voice/audio fingerprinting (complex)
   - Manual selection (simple)
   - **Recommendation:** Manual selection for MVP

5. **Tone & Personalization:** How to adjust coaching tone for different ages/skill levels?
   - Elementary (5-10): Fun, encouraging, simple
   - Middle school (11-14): Engaging, challenging, peer-relevant
   - High school (15-18): Technical, sophisticated, goal-oriented
   - **Recommendation:** User profile setting (age/skill level)

## Technical Decisions

### Decision Log

| Decision | Rationale | Date | Status |
|----------|-----------|------|--------|
| Use AudD over ShazamKit | Cross-platform support, reasonable pricing, handles live instruments | 2025-12-02 | ✅ Decided |
| Next.js App Router | Modern React patterns, built-in API routes, works on mobile & desktop | 2025-12-02 | ✅ Decided |
| MusicBrainz for metadata | Free, comprehensive songwriter/composer data | 2025-12-02 | ✅ Decided |
| Spotify for recommendations | Best recommendation engine, free | 2025-12-02 | ✅ Decided |
| OpenAI/Claude for coaching content | Essential for personalized, age-appropriate wise cracks & coaching moments | 2025-12-02 | ✅ Decided |
| Manual trigger over continuous listening | Lower API costs for MVP, easier to control | 2025-12-02 | ✅ Decided |
| Mobile-first design | Primary use case is phone near practice area | 2025-12-02 | ✅ Decided |

---

**Last Updated:** 2025-12-02
**Status:** Planning Phase
**Next Review:** After Phase 1 completion

