'use client'

import type { LoadingState as LoadingStateType } from '@/lib/types'

interface LoadingStateProps {
  state: LoadingStateType
}

const stateMessages: Record<LoadingStateType, { title: string; description: string; icon: string }> = {
  idle: {
    title: 'Ready to Listen',
    description: 'Tap the button when your child starts playing',
    icon: '🎵',
  },
  recording: {
    title: 'Listening...',
    description: 'Capturing audio from the performance',
    icon: '🎤',
  },
  recognizing: {
    title: 'Identifying Song',
    description: 'Analyzing the audio to find a match',
    icon: '🔍',
  },
  'fetching-metadata': {
    title: 'Getting Details',
    description: 'Fetching song information and composer details',
    icon: '📚',
  },
  'generating-coaching': {
    title: 'Preparing Suggestions',
    description: 'Creating personalized coaching content',
    icon: '✨',
  },
  complete: {
    title: 'All Done!',
    description: 'Here are your coaching suggestions',
    icon: '✅',
  },
  error: {
    title: 'Something Went Wrong',
    description: 'Please try again',
    icon: '⚠️',
  },
}

export function LoadingState({ state }: LoadingStateProps) {
  const { title, description, icon } = stateMessages[state]
  const isLoading = !['idle', 'complete', 'error'].includes(state)

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
      <div className="text-6xl mb-4">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900">
        {title}
      </h3>
      
      <p className="text-slate-600">
        {description}
      </p>

      {isLoading && (
        <div className="flex justify-center pt-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

