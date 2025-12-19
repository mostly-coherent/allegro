# Allegro - Development Guide

> AI Assistant Context: This file contains technical setup and development guidance for working with this codebase.

## 🚨 CRITICAL: GitHub Safety

**This project syncs to personal GitHub only.**

Git remote: Check with `git remote -v`
Git author: Check with `git config user.email`

**Vercel:** DO NOT push/deploy unless explicitly requested (git push = auto-deploy)

## Project Type
Next.js 14+ app with TypeScript for parents to engage with kids' music practice. Identifies songs from live piano/guitar playing and generates personalized coaching content.

## Use Case Context
**Primary user:** Parent working at desk while kids practice piano/guitar nearby
**Goal:** Provide wise cracks, coaching moments, and encouragement suggestions
**Key constraint:** Must work with live instrument playing (not just recordings)

## Tech Stack
*Follows root CLAUDE.md defaults with project-specific additions:*

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (for caching, user preferences)
- **AI/LLM:** Anthropic Claude (coaching content generation)
- **Streaming:** Vercel AI SDK for coaching responses
- **Audio:** Web Audio API
- **External APIs:** AudD (recognition), MusicBrainz (metadata), Spotify (recommendations)

## Quick Reference

### API Integration Summary
1. **AudD API** - Music recognition from live instruments (primary, paid)
2. **MusicBrainz API** - Songwriter/composer metadata (free, rate limited)
3. **Spotify Web API** - "What's next" recommendations (OAuth required)
4. **OpenAI/Claude API** - Generate personalized wise cracks & coaching moments (paid, essential)
5. **Wikipedia API** - Biographical information (free, optional)

See `Plan.md` for detailed product requirements and architecture decisions.

## Key Commands

### Development
```bash
npm install                  # Install dependencies
npm run dev                  # Start dev server (http://localhost:3000)
npm run build                # Production build
npm run lint                 # Run ESLint
npm test                     # Run tests
```

### Deployment
```bash
vercel --prod                # Deploy to Vercel production
```

## Project Structure
```
/app                         # Next.js App Router
  /api                       # API routes (server-side)
    /recognize               # Audio recognition endpoint
    /metadata                # Metadata fetching
  /components                # Page-level components
  layout.tsx                 # Root layout
  page.tsx                   # Home page

/components                  # Reusable React components
  /audio                     # Microphone capture, audio processing
  /results                   # Song info display, similar tracks
  /ui                        # Generic UI components

/lib                         # Utilities and API clients
  /apis                      # API integration modules
    audd.ts                  # AudD API client
    musicbrainz.ts           # MusicBrainz API client
    spotify.ts               # Spotify API client
    wikipedia.ts             # Wikipedia API client
    genius.ts                # Genius API client
  /utils                     # Helper functions
  /types                     # TypeScript type definitions

/public                      # Static assets
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required
- `AUDD_API_KEY` - AudD music recognition API (handles live instruments)
- `MUSICBRAINZ_USER_AGENT` - Format: "Allegro/1.0 (https://github.com/mostly-coherent/Allegro)"
- `SPOTIFY_CLIENT_ID` - Spotify app credentials (for recommendations)
- `SPOTIFY_CLIENT_SECRET` - Spotify app credentials
- `OPENAI_API_KEY` - OpenAI API (essential for generating coaching content)

### Optional
- `MUSICBRAINZ_EMAIL` - For higher rate limits
- `ANTHROPIC_API_KEY` - Alternative to OpenAI for Claude API

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Functional components with hooks
- Tailwind for styling (no inline styles)
- Descriptive variable names
- Error boundaries for API failures

### API Integration Patterns
```typescript
// Example: API client structure
export async function recognizeSong(audioBlob: Blob) {
  try {
    const response = await fetch('/api/recognize', {
      method: 'POST',
      body: audioBlob,
    });
    if (!response.ok) throw new Error('Recognition failed');
    return await response.json();
  } catch (error) {
    console.error('Recognition error:', error);
    throw error;
  }
}
```

### Caching Strategy
- Cache MusicBrainz responses (rate limited)
- Cache Wikipedia data (static biographical info)
- Don't cache AudD responses (usage-based pricing)
- Use React Query or SWR for client-side caching

### Error Handling
- Graceful degradation (show partial results if some APIs fail)
- User-friendly error messages
- Retry logic for transient failures
- Fallback to alternative APIs when available

## Implementation Flow

1. **Capture Audio:** User taps button → `navigator.mediaDevices.getUserMedia()` → 5-10s sample
2. **Identify Song:** Send to `/api/recognize` (AudD API)
3. **Parallel Fetch:**
   - MusicBrainz (songwriter/composer)
   - Spotify ("what's next" recommendations)
   - Wikipedia (biographical context - optional)
4. **Generate Coaching Content:** Send metadata to `/api/generate-coaching` (OpenAI/Claude)
   - Input: Song info + child age/skill level
   - Output: Wise cracks, coaching moments, encouragement prompts
5. **Display:** Show results with loading states for each section

## Key Implementation Considerations

### Live Instrument Recognition
- AudD may struggle with imperfect playing (wrong notes, tempo issues)
- Consider longer audio samples (10s vs 5s) for better accuracy
- Implement fallback: "Can't identify? Try manual search"
- Test extensively with real kid practice sessions

### Coaching Content Generation
- Cache generated content per song to reduce API costs
- Personalize based on age/skill level settings
- Categories: Wise cracks, Coaching moments, Encouragement, What's next
- Tone: Supportive, not critical; engaging, not condescending

### Mobile-First Design
- Primary use case: phone near practice area
- Large tap targets for "Listen" button
- Readable text at arm's length
- Works in background (doesn't require constant attention)

## Testing Notes

- **Critical:** Test with live piano/guitar playing (not just recordings)
- Test with beginner-level playing (wrong notes, tempo issues)
- Test microphone permissions on iOS Safari and Chrome Android
- Test with background noise (household sounds)
- Test error cases (no match, API failures, rate limits)
- Test coaching content for different age groups (5-10, 11-14, 15-18)

---

**Last Updated:** 2025-12-01
