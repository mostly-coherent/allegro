#!/bin/bash

# Allegro Environment Setup Script
# Run this script to create your .env.local file

cd "$(dirname "$0")"

if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    echo "Do you want to overwrite it? (y/n)"
    read -r answer
    if [ "$answer" != "y" ]; then
        echo "Cancelled. Edit .env.local manually if needed."
        exit 0
    fi
fi

cat > .env.local << 'EOF'
# Allegro API Keys
# Fill in your actual API keys below

# ===========================================
# REQUIRED: AudD API - Song Recognition
# ===========================================
# Sign up at: https://audd.io/
# Get API key from dashboard (300 free recognitions to start)
AUDD_API_KEY=

# ===========================================
# REQUIRED: OpenAI API - AI Coaching Content
# ===========================================
# Get API key at: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# ===========================================
# OPTIONAL: Spotify API - Song Recommendations
# ===========================================
# Create app at: https://developer.spotify.com/dashboard
# Click "Create App" → Get Client ID and Secret
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# ===========================================
# AUTO-CONFIGURED: MusicBrainz (no key needed)
# ===========================================
MUSICBRAINZ_USER_AGENT=Allegro/1.0 (https://github.com/mostly-coherent/Allegro)

# ===========================================
# OPTIONAL: Your email for higher MusicBrainz rate limits
# ===========================================
MUSICBRAINZ_EMAIL=

# ===========================================
# App Configuration
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo ""
echo "✅ Created .env.local successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Open .env.local in your editor"
echo "   2. Add your API keys (see URLs in comments)"
echo "   3. Run: npm run dev"
echo ""
echo "🔑 Required API keys:"
echo "   • AUDD_API_KEY      → https://audd.io/"
echo "   • OPENAI_API_KEY    → https://platform.openai.com/api-keys"
echo ""
echo "🎵 Optional (for recommendations):"
echo "   • SPOTIFY_CLIENT_ID/SECRET → https://developer.spotify.com/dashboard"
echo ""

