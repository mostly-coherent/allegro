# 🎹 Allegro

> *Allegro* (Italian): Cheerful, lively — A personal coaching companion that identifies what your kids are playing on piano/guitar and provides wise cracks, coaching moments, and encouragement.

![Type](https://img.shields.io/badge/Type-App-blue)
![Status](https://img.shields.io/badge/Status-Active%20Dev-green)
![Stack](https://img.shields.io/badge/Stack-Next.js%2014%20%7C%20TypeScript%20%7C%20Tailwind-blue)

![Allegro Homepage](e2e-results/01-homepage.png)

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp env.example .env.local
# Edit .env.local with your API keys (AudD, Spotify, OpenAI)

# 3. Run
npm run dev
```

**→ Open http://localhost:3000**

### Step 1: Get Your API Keys

You need one API key to start testing:

**AudD API** (Required for song recognition)
1. Go to https://audd.io/
2. Sign up for a free account
3. Get your API key from the dashboard
4. You get 300 free recognitions to start

*Optional for later: Spotify, OpenAI keys for future features*

### Step 2: Configure Environment

Edit `.env.local` and add your AudD API key:

```bash
AUDD_API_KEY=your_actual_api_key_here
MUSICBRAINZ_USER_AGENT=Allegro/1.0 (your-app-url)
```

### Step 3: Test the App

1. **Click "Start Listening"** - Grant microphone permission when prompted
2. **Play some music** - Either:
   - Play a song on piano/guitar (best results with well-known songs)
   - Play music from your phone/speaker near the microphone
3. **Wait for recognition** - The app will identify the song in a few seconds
4. **View results** - See song information and details

### Testing Tips

**Best Results:**
- Place phone/computer 3-6 feet from instrument
- Record during a distinctive melody (not intro/outro)
- Let them play at normal volume (not too soft)
- Minimize talking, TV, other background noise
- Popular songs work better than obscure ones
- Wait for a good melody section (not just chords)

**Expected Accuracy:**
- Popular songs: 80-90% success rate
- Classical pieces: 60-70% (depends on recording quality)
- Beginner playing: 40-60% (many wrong notes confuse the system)

**Response Time:**
- Recording: 10 seconds (configurable)
- Recognition: 2-5 seconds
- Total: ~12-15 seconds from start to results

### Troubleshooting

**Microphone Not Working:**
- Check browser support: Chrome, Safari, Firefox, Edge (modern versions)
- Check permissions: Browser settings → Site permissions → Microphone
- HTTPS required: Production needs HTTPS (Vercel provides this automatically)
- Try different browser: Some browsers handle audio better than others

**Song Not Recognized:**
- Record longer: Try 10-15 seconds instead of 5
- Play louder: Ensure instrument/music is clearly audible
- Reduce noise: Minimize background sounds
- Try different part: Record during a distinctive melody section
- Check song popularity: Obscure songs may not be in AudD's database

**API Errors:**
- Check API key: Verify it's correct in `.env.local`
- Check API credits: Log into https://audd.io/ to see remaining credits
- Check network: Ensure internet connection is working
- Check API status: Visit https://audd.io/ to see if service is up

---

<details>
<summary><strong>✨ Features</strong></summary>

- **Instant song identification:** Tap to identify live piano/guitar playing (AudD API).
- **Smart suggestions:** Receive wise cracks, coaching prompts, and encouragement personalized to the song.
- **"What's next" recommendations:** Spotify-powered suggestions for songs to learn next.
- **Mobile-first:** Designed to be used on your phone near the practice area.
- **Graceful degradation:** Partial results if some APIs fail.

</details>

<details>
<summary><strong>🎯 How It Works</strong></summary>

1. **Listen:** Open the app on your phone near where your kids practice.
2. **Tap to Identify:** When you hear them playing, tap the button.
3. **Get Smart Suggestions:** Receive coaching content personalized to the song.
4. **Engage:** Use the suggestions to connect meaningfully during practice.

</details>

<details>
<summary><strong>⚙️ Environment Variables</strong></summary>

Create `.env` from `env.example`:

| Variable | Description |
|----------|-------------|
| `AUDD_API_KEY` | AudD music recognition (identifies songs from live playing) |
| `MUSICBRAINZ_USER_AGENT` | MusicBrainz API user agent (composer/songwriter info) |
| `SPOTIFY_CLIENT_ID` | Spotify app credentials (recommendations) |
| `SPOTIFY_CLIENT_SECRET` | Spotify app credentials |
| `OPENAI_API_KEY` | OpenAI API (generates coaching content) |
| `ANTHROPIC_API_KEY` | Alternative to OpenAI for Claude |

</details>

<details>
<summary><strong>🛠️ Available Scripts</strong></summary>

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Check code quality
npm test         # Run tests
```

</details>

<details>
<summary><strong>🚢 Deployment</strong></summary>

Recommended: Deploy to Vercel

1. Build locally and verify: `npm run build`
2. Connect GitHub repo to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy: `vercel --prod`

</details>

<details>
<summary><strong>💭 What I Learned</strong></summary>

Multi-API orchestration: AudD for recognition, MusicBrainz for metadata, Spotify for recommendations, Claude for coaching suggestions. Each service fails gracefully without breaking the experience. What surprised me: audio recognition trained on studio recordings struggles with music practice. Kids stop mid-phrase, repeat sections, play wrong notes—that abrupt start-stop-repeat pattern makes it hard to identify the song. Real-world use breaks clean assumptions.

</details>

<details>
<summary><strong>🎯 Current Challenge: Single-Instrument Recognition</strong></summary>

Most song recognition APIs (including AudD) are optimized for full studio recordings—multi-instrument arrangements with vocals. Allegro needs to identify songs from **single-instrument playing** (just piano or just guitar), which is significantly harder. I'm actively exploring approaches to improve accuracy for monophonic/polyphonic single-instrument audio. **Open to ideas and advice**—if you've tackled similar challenges or know of APIs/models better suited for this use case, I'd love to hear about it!

</details>

<details>
<summary><strong>🔮 What's Next</strong></summary>

Building **real-time "play along" suggestions**—analyzing what my kids are playing and recommending chords/riffs so I can jam with them on guitar. Same audio challenge, but now matching imperfect playing to playable chord progressions in real-time.

</details>

<details>
<summary><strong>📚 Development Notes</strong></summary>

- See `CLAUDE.md` for detailed technical setup and development commands.
- See `Plan.md` for detailed product requirements and architecture decisions.
- See `BUILD_LOG.md` for chronological progress.

</details>

---

**Status:** Active Development | **Purpose:** Personal learning and portfolio project
