# 🎹 Allegro

> *Allegro* (Italian): Cheerful, lively — the spirit of joyful practice

**A personal coaching companion for parents whose kids are learning piano and guitar.** Listen to practice sessions, identify what they're playing, and get wise cracks, coaching moments, and encouragement—even if you're not a music expert.

---

## 🚀 See It Running

### Option A: Auto-Generate Server Scripts (Recommended)

In Cursor Chat, type:

```
@Generate-server-scripts.md @Allegro
```

This creates `start-servers.sh`, `stop-servers.sh`, and `check-servers.sh` for one-command startup.

### Option B: Manual Quick Start

```bash
npm install
cp env.example .env
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## ✨ Features

- **Instant song identification** — Tap a button to identify what your kids are playing (live piano/guitar)
- **Smart suggestions** — Get wise cracks, coaching prompts, and encouragement tailored to the song
- **"What's next" recommendations** — Spotify-powered suggestions for songs to learn next
- **Mobile-first** — Designed to use on your phone near the practice area
- **Graceful degradation** — Partial results if some APIs fail

## 🎯 How It Works

1. **Listen** — Open the app on your phone near where your kids practice
2. **Tap to Identify** — When you hear them playing, tap the button
3. **Get Smart Suggestions** — Receive coaching content personalized to the song
4. **Engage** — Use the suggestions to connect meaningfully during practice

## 🔑 Environment Variables

Create `.env` from `env.example` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `AUDD_API_KEY` | ✅ | AudD music recognition (identifies songs from live playing) |
| `MUSICBRAINZ_USER_AGENT` | ✅ | MusicBrainz API user agent (composer/songwriter info) |
| `SPOTIFY_CLIENT_ID` | ✅ | Spotify app credentials (recommendations) |
| `SPOTIFY_CLIENT_SECRET` | ✅ | Spotify app credentials |
| `OPENAI_API_KEY` | ✅ | OpenAI API (generates coaching content) |
| `ANTHROPIC_API_KEY` | | Alternative to OpenAI for Claude |

## 🚢 Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Configure environment variables in Vercel dashboard before deploying.

---

## 💭 What I Learned

Multi-API orchestration: AudD for recognition, MusicBrainz for metadata, Spotify for recommendations, Claude for coaching suggestions. Each service fails gracefully without breaking the experience. What surprised me: audio recognition trained on studio recordings struggles with music practice. Kids stop mid-phrase, repeat sections, play wrong notes—that abrupt start-stop-repeat pattern makes it hard to identify the song. Real-world use breaks clean assumptions.

## 🔮 What's Next

Building **real-time "play along" suggestions**—analyzing what my kids are playing and recommending chords/riffs so I can jam with them on guitar. Same audio challenge, but now matching imperfect playing to playable chord progressions in real-time.

---

**Status:** Active Development  
**Stack:** Next.js 14 · TypeScript · Tailwind · AudD · Spotify · OpenAI

See `CLAUDE.md` for detailed technical setup and development commands.
