# Allegro

![Type](https://img.shields.io/badge/Type-App-blue)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20TypeScript%20%7C%20Tailwind-blue)

> *Allegro* (Italian): Cheerful, lively - A musical tempo marking and the spirit of joyful practice

A personal coaching companion for parents whose kids are learning piano and guitar. Listen to practice sessions, identify what they're playing, and get smart suggestions for wise cracks, coaching moments, and encouragement - even if you're not a music expert yourself.

## Features

- **Core value:** Turn passive listening into active engagement during your kids' music practice
- **Key workflow:** Listen → Identify → Get coaching suggestions → Engage meaningfully
- **Smart suggestions:** Wise cracks, coaching moments, encouragement prompts, and "what's next" recommendations
- **Integration:** AudD (recognition), MusicBrainz (metadata), Spotify (recommendations), OpenAI/Claude (personalized coaching content)
- **Extras:** Age-appropriate tone, works with live instruments, mobile-friendly for use near practice area

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with the required keys and settings for this project.

### 3. Run the app

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Environment Variables

Required API keys (see `.env.example` for full list):

- **`AUDD_API_KEY`** – AudD music recognition API key (identifies songs from live playing)
- **`MUSICBRAINZ_USER_AGENT`** – MusicBrainz API user agent (gets composer/songwriter info)
- **`SPOTIFY_CLIENT_ID`** – Spotify app client ID (for "what's next" recommendations)
- **`SPOTIFY_CLIENT_SECRET`** – Spotify app client secret
- **`OPENAI_API_KEY`** – OpenAI API key (generates personalized coaching content)

## How It Works

1. **Listen** - Open the app on your phone/computer near where your kids practice
2. **Tap to Identify** - When you hear them playing something, tap the button to identify it
3. **Get Smart Suggestions** - Receive wise cracks, coaching moments, and encouragement prompts
4. **Engage** - Use the suggestions to connect with your kids about their practice

## The Problem This Solves

**Scenario:** Your kids are practicing piano/guitar behind your desk. You want to be supportive and engaged, but:
- You don't always recognize what they're playing
- You're not sure what to say that's helpful (not just "sounds good!")
- You want to encourage them without being overbearing
- You'd like to suggest what they might enjoy learning next

**Solution:** This app gives you the context and conversation tools to be an engaged, supportive parent - even if you're not a music expert.

## Primary Use Case

**Parents of kids learning instruments (ages 5-18)**
- Want to support their children's music education
- May not have formal music training
- Looking for meaningful ways to engage during practice
- Want to encourage without interrupting or criticizing

## Deployment

Deployed on Vercel:

1. Connect this GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

## What I Learned

Multi-API orchestration: AudD for recognition, MusicBrainz for metadata, Spotify for recommendations, Claude for coaching suggestions. Each service fails gracefully without breaking the experience. What surprised me: audio recognition trained on studio recordings struggles with music practice. Kids stop mid-phrase, repeat sections, play wrong notes—that abrupt start-stop-repeat pattern makes it hard to identify the song, let alone the version or composer. Suddenly I needed "close enough" matching that works with fragments. Real-world use breaks clean assumptions.

## What's Next

I'm building **real-time "play along" suggestions**—analyzing what my kids are playing and recommending chords/riffs so I can jam with them on guitar. This builds on the audio recognition lessons: matching their imperfect playing to playable chord progressions in real-time, keeping suggestions simple enough for my skill level, and making the "close enough" matching work when they drift tempo or hit wrong notes. It's the same audio challenge as before, but now with the added complexity of making recommendations musically coherent.

---

**Status:** Active Development (Constant Work in Progress)  
**Purpose:** Personal learning and portfolio project
