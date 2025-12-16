# Allegro Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/jmbeh/Personal\ Builder\ Lab/Allegro
npm install
```

### 2. Configure Environment Variables

Copy the environment template and add your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` with your API keys:

**Required API Keys:**

1. **AudD API** (Music Recognition)
   - Sign up at: https://audd.io/
   - Get your API key from the dashboard
   - Add to `.env.local`: `AUDD_API_KEY=your_key_here`

2. **MusicBrainz** (Metadata)
   - No signup required
   - Set user agent: `MUSICBRAINZ_USER_AGENT=Allegro/1.0 (https://github.com/JMBeh/Allegro)`
   - Optional: Add your email for higher rate limits

3. **Spotify API** (Recommendations - for future features)
   - Create an app at: https://developer.spotify.com/dashboard
   - Get Client ID and Secret
   - Add to `.env.local`

4. **OpenAI API** (Coaching Content - for future features)
   - Get API key at: https://platform.openai.com/api-keys
   - Add to `.env.local`: `OPENAI_API_KEY=your_key_here`

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Testing the App

1. **Click "Start Listening"** - Grant microphone permission when prompted
2. **Play some music** - Either:
   - Play a song on piano/guitar (best results with well-known songs)
   - Play music from your phone/speaker near the microphone
3. **Wait for recognition** - The app will identify the song in a few seconds
4. **View results** - See song information and details

## Current Features (Phase 1 - MVP)

✅ Audio capture from microphone
✅ Live instrument recognition (via AudD API)
✅ Song information display
✅ Mobile-responsive design
✅ Error handling and loading states

## Coming Soon (Future Phases)

🔄 Songwriter/composer information (MusicBrainz integration)
🔄 AI-generated coaching content (wise cracks, coaching moments)
🔄 Song recommendations (Spotify integration)
🔄 Wikipedia fun facts about artists
🔄 Practice session tracking

## Troubleshooting

### Microphone Not Working

- **Browser Support:** Use Chrome, Safari, Firefox, or Edge
- **Permissions:** Check browser settings → Site permissions → Microphone
- **HTTPS Required:** Localhost works, but production needs HTTPS

### Song Not Recognized

- **Recording Duration:** Try recording for 8-10 seconds
- **Audio Quality:** Ensure instrument is clearly audible
- **Song Selection:** Works best with recognizable melodies
- **Background Noise:** Minimize ambient sounds

### API Errors

- **AudD Error:** Check your API key and credit balance at https://audd.io/
- **Rate Limits:** MusicBrainz limits ~1 request/second
- **Network:** Ensure you have internet connectivity

## Project Structure

```
/app
  /api/recognize       - Song recognition endpoint
  layout.tsx           - Root layout with header/footer
  page.tsx             - Main page with audio recorder
  globals.css          - Global styles and animations

/components
  AudioRecorder.tsx    - Microphone capture component
  SongResult.tsx       - Song information display
  LoadingState.tsx     - Loading state indicator
  ErrorDisplay.tsx     - Error handling UI

/lib
  /apis/audd.ts       - AudD API client
  /utils/audio.ts     - Audio recording utilities
  /types/index.ts     - TypeScript type definitions
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Next Steps

1. **Test with Real Practice Sessions**
   - Have your kids practice and test the recognition
   - Note which songs work well and which don't

2. **Deploy to Vercel**
   - Connect GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Phase 2 Features** (See Plan.md)
   - Add coaching content generation
   - Integrate Spotify recommendations
   - Add Wikipedia fun facts

## Support

- Review CLAUDE.md for technical details
- Review Plan.md for product roadmap
- Check README.md for project overview

---

**Ready to engage with your kids' music practice!** 🎵

