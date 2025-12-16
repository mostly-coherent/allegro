'use client'

import { useState } from 'react'
import type { CoachingContent } from '@/lib/types'

interface CoachingSectionProps {
  coaching: CoachingContent | null
  isLoading: boolean
  isFallback?: boolean
}

interface CoachingItemProps {
  icon: string
  text: string
  onCopy: () => void
  copied: boolean
}

function CoachingItem({ icon, text, onCopy, copied }: CoachingItemProps) {
  return (
    <div className="group flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <p className="flex-1 text-slate-700 text-sm leading-relaxed">{text}</p>
      <button
        onClick={onCopy}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded hover:bg-white"
        title="Copy to clipboard"
        aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  )
}

export function CoachingSection({ coaching, isLoading, isFallback }: CoachingSectionProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)

  const handleCopy = async (text: string, index: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <h3 className="text-lg font-semibold text-slate-900">Generating Coaching Ideas...</h3>
        </div>
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!coaching) {
    return null
  }

  const sections = [
    {
      title: '😄 Wise Cracks',
      subtitle: 'Fun comments to make them smile',
      items: coaching.wiseCracks,
      icon: '💬',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-100',
    },
    {
      title: '🎯 Coaching Moments',
      subtitle: 'Supportive observations and tips',
      items: coaching.coachingMoments,
      icon: '🎵',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-100',
    },
    {
      title: '⭐ Encouragement',
      subtitle: 'Genuine compliments for their effort',
      items: coaching.encouragementPrompts,
      icon: '✨',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-100',
    },
    {
      title: '🚀 What\'s Next',
      subtitle: 'Conversation starters about future learning',
      items: coaching.whatsNext || [],
      icon: '💡',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-100',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <h3 className="text-lg font-semibold text-slate-900">Coaching Suggestions</h3>
        </div>
        {isFallback && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Generic suggestions
          </span>
        )}
      </div>
      
      <p className="text-sm text-slate-600">
        Use these conversation starters to engage with your child about their practice. 
        <span className="text-slate-500"> Hover and click to copy!</span>
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((section) => (
          section.items.length > 0 && (
            <div 
              key={section.title}
              className={`bg-gradient-to-br ${section.bgColor} rounded-xl p-4 border ${section.borderColor}`}
            >
              <div className="mb-3">
                <h4 className="font-semibold text-slate-900">{section.title}</h4>
                <p className="text-xs text-slate-500">{section.subtitle}</p>
              </div>
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <CoachingItem
                    key={`${section.title}-${idx}`}
                    icon={section.icon}
                    text={item}
                    onCopy={() => handleCopy(item, `${section.title}-${idx}`)}
                    copied={copiedIndex === `${section.title}-${idx}`}
                  />
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      <p className="text-xs text-slate-400 text-center pt-2">
        {isFallback 
          ? 'Configure OpenAI API for personalized, song-specific suggestions'
          : 'Generated with AI based on this specific song'}
      </p>
    </div>
  )
}

