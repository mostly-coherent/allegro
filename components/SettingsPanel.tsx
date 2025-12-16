'use client'

import { useState } from 'react'
import type { UserSettings } from '@/lib/types'

interface SettingsPanelProps {
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAgeChange = (age: number | undefined) => {
    onSettingsChange({ ...settings, childAge: age })
  }

  const handleSkillChange = (skillLevel: 'beginner' | 'intermediate' | 'advanced') => {
    onSettingsChange({ ...settings, skillLevel })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="settings-panel-content"
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">⚙️</span>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900">Personalization Settings</h3>
            <p className="text-sm text-slate-500">
              {settings.childAge 
                ? `Age ${settings.childAge}, ${settings.skillLevel || 'beginner'} level`
                : 'Customize coaching for your child'}
            </p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div id="settings-panel-content" className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
          {/* Age Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Child&apos;s Age
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Any', value: undefined },
                { label: '5-7', value: 6 },
                { label: '8-10', value: 9 },
                { label: '11-13', value: 12 },
                { label: '14-17', value: 15 },
                { label: '18+', value: 18 },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleAgeChange(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (settings.childAge === option.value) || 
                    (!settings.childAge && option.value === undefined)
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Skill Level
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🌱 Beginner', value: 'beginner' as const, desc: 'Just started' },
                { label: '🌿 Intermediate', value: 'intermediate' as const, desc: '1-3 years' },
                { label: '🌳 Advanced', value: 'advanced' as const, desc: '3+ years' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSkillChange(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.skillLevel === option.value || 
                    (!settings.skillLevel && option.value === 'beginner')
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            These settings help personalize the coaching suggestions to be age-appropriate and relevant.
          </p>
        </div>
      )}
    </div>
  )
}

