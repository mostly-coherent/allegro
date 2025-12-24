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
cp env.example .env
# Edit .env with your API keys (AudD, Spotify, OpenAI)

# 3. Run
npm run dev
```

**→ Open http://localhost:3000**

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
