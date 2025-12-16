// AI Coaching Content Generation
// Uses OpenAI or Anthropic Claude to generate personalized coaching content

import type { CoachingContent, Song, MusicBrainzMetadata, WikipediaInfo } from '@/lib/types'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

interface CoachingContext {
  song: Song
  metadata?: MusicBrainzMetadata | null
  wikipedia?: WikipediaInfo | null
  funFacts?: string[]
  childAge?: number
  skillLevel?: 'beginner' | 'intermediate' | 'advanced'
}

function getAgeGroup(age?: number): string {
  if (!age) return 'general'
  if (age <= 7) return 'young child (5-7 years old)'
  if (age <= 10) return 'child (8-10 years old)'
  if (age <= 13) return 'preteen (11-13 years old)'
  if (age <= 17) return 'teenager (14-17 years old)'
  return 'young adult (18+)'
}

function buildPrompt(context: CoachingContext): string {
  const { song, metadata, wikipedia, funFacts, childAge, skillLevel } = context
  
  const ageGroup = getAgeGroup(childAge)
  const skill = skillLevel || 'beginner'
  
  // Build context about the song
  let songContext = `Song: "${song.title}" by ${song.artist}`
  if (song.album) songContext += `\nAlbum: ${song.album}`
  if (song.releaseDate) songContext += `\nReleased: ${song.releaseDate}`
  
  // Add composer/songwriter info
  if (metadata?.composers?.length) {
    songContext += `\nComposers: ${metadata.composers.map(c => c.name).join(', ')}`
  }
  if (metadata?.songwriters?.length) {
    songContext += `\nArtists/Songwriters: ${metadata.songwriters.map(s => s.name).join(', ')}`
  }
  
  // Add Wikipedia facts
  if (wikipedia?.summary) {
    songContext += `\n\nBackground: ${wikipedia.summary.substring(0, 500)}...`
  }
  if (funFacts?.length) {
    songContext += `\n\nFun facts:\n${funFacts.slice(0, 3).map(f => `- ${f}`).join('\n')}`
  }

  return `You are a friendly, supportive music practice coach helping a parent engage with their child during piano/guitar practice.

The child is a ${ageGroup} at the ${skill} skill level.

${songContext}

Generate coaching content that a parent can use to engage with their child about this song. The parent is NOT a music expert, so keep suggestions accessible and fun.

Provide EXACTLY this JSON structure (no markdown, just valid JSON):
{
  "wiseCracks": [
    "A fun, light comment or joke about the song/artist to make the child smile",
    "Another playful observation or fun fact presented casually",
    "A third witty or amusing comment"
  ],
  "coachingMoments": [
    "A specific, encouraging tip about playing this song (technique, rhythm, etc.)",
    "An observation the parent could make to show they're paying attention"
  ],
  "encouragementPrompts": [
    "A genuine, specific compliment template for this song/performance",
    "An encouraging statement that acknowledges effort and progress"
  ],
  "whatsNext": [
    "A natural conversation starter about what they might learn next"
  ]
}

Important guidelines:
- Age-appropriate language and references for ${ageGroup}
- Supportive tone, never critical
- Specific to THIS song when possible
- Easy for non-musician parents to use naturally
- Fun and engaging, not preachy
- Keep each item 1-2 sentences max`
}

export async function generateCoachingContent(
  context: CoachingContext
): Promise<CoachingContent | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      console.log('OpenAI API key not configured')
      return null
    }

    const prompt = buildPrompt(context)

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('No content in OpenAI response')
      return null
    }

    // Parse the JSON response
    try {
      // Clean up potential markdown code blocks
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      const parsed = JSON.parse(cleanedContent)
      
      return {
        wiseCracks: parsed.wiseCracks || [],
        coachingMoments: parsed.coachingMoments || [],
        encouragementPrompts: parsed.encouragementPrompts || [],
        whatsNext: parsed.whatsNext || [],
      }
    } catch (parseError) {
      console.error('Failed to parse coaching content:', parseError)
      console.log('Raw content:', content)
      return null
    }
  } catch (error) {
    console.error('Coaching generation error:', error)
    return null
  }
}

// Fallback content when AI is not available
export function getFallbackCoachingContent(song: Song): CoachingContent {
  return {
    wiseCracks: [
      `Did you know "${song.title}" is one of ${song.artist}'s most popular songs?`,
      `I bet even ${song.artist} had to practice this one a lot!`,
      `This song sounds even better on a real instrument than on the radio!`,
    ],
    coachingMoments: [
      `I noticed you're really working on that tricky part - keep at it!`,
      `Try playing that section a little slower and see if it helps.`,
    ],
    encouragementPrompts: [
      `I can hear how much you've improved since you started learning this!`,
      `Your practice is really paying off - that sounded great!`,
    ],
    whatsNext: [
      `What part of the song do you want to work on next?`,
    ],
  }
}

export async function checkOpenAICredentials(): Promise<boolean> {
  return !!process.env.OPENAI_API_KEY
}

