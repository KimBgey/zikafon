'use client'
import { useEffect, useState } from 'react'

export type LoadingStep = 'idle' | 'analyzing' | 'searching' | 'done'

interface LoadingScreenProps {
  step: LoadingStep
  moodKeywords?: string[]
}

const STEPS = [
  { id: 'analyzing', label: 'Gemini analyse ton humeur…', sub: 'On décrypte chaque nuance de ton mood' },
  { id: 'searching', label: 'On cherche tes tracks…',     sub: 'Deezer parcourt des millions de titres' },
]

// Fun phrases that rotate during loading
const VIBES_COPY = [
  'Ton mood parle, la musique écoute 👂',
  'Les bonnes vibes arrivent… ✨',
  'On fouille les recoins de Deezer 🔍',
  'La playlist parfaite se prépare 🎧',
  'Un peu de magie musicale… 🪄',
  'Prépare tes oreilles 🎶',
]

export function LoadingScreen({ step, moodKeywords = [] }: LoadingScreenProps) {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [dotsCount, setDotsCount] = useState(1)
  const [barsHeights, setBarsHeights] = useState([4, 8, 12, 6, 10, 4, 8])

  // Rotate fun phrases every 2.5s
  useEffect(() => {
    if (step === 'idle') return
    const id = setInterval(() => {
      setPhraseIdx(i => (i + 1) % VIBES_COPY.length)
    }, 2500)
    return () => clearInterval(id)
  }, [step])

  // Animate dots
  useEffect(() => {
    if (step === 'idle') return
    const id = setInterval(() => setDotsCount(d => d === 3 ? 1 : d + 1), 500)
    return () => clearInterval(id)
  }, [step])

  // Animate waveform bars
  useEffect(() => {
    if (step === 'idle') return
    const id = setInterval(() => {
      setBarsHeights(prev =>
        prev.map(() => Math.floor(Math.random() * 28) + 4)
      )
    }, 120)
    return () => clearInterval(id)
  }, [step])

  if (step === 'idle') return null

  const currentStepIdx = STEPS.findIndex(s => s.id === step)
  const dots = '.'.repeat(dotsCount)

  return (
    <div className="loading-overlay" aria-live="polite" aria-label="Chargement en cours">

      {/* Aurora animated blobs */}
      <div className="loading-blob loading-blob-1" />
      <div className="loading-blob loading-blob-2" />
      <div className="loading-blob loading-blob-3" />

      {/* Floating particles */}
      <div className="loading-particles" aria-hidden="true">
        {['♪','♫','♩','♬','♭','♪','♫'].map((note, i) => (
          <span key={i} className={`loading-particle loading-particle-${i + 1}`}>{note}</span>
        ))}
      </div>

      <div className="loading-card animate-scale-in">

        {/* Waveform visualizer */}
        <div className="loading-waveform" aria-hidden="true">
          {barsHeights.map((h, i) => (
            <div
              key={i}
              className="loading-bar"
              style={{ height: `${h}px`, animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>

        {/* Main message */}
        <div className="loading-main">
          <p className="loading-step-label">
            {STEPS[currentStepIdx]?.label ?? 'Chargement'}{dots}
          </p>
          <p className="loading-step-sub">
            {STEPS[currentStepIdx]?.sub}
          </p>
        </div>

        {/* Mood keywords — appear once Gemini responds */}
        {moodKeywords.length > 0 && (
          <div className="loading-keywords animate-slide-up">
            {moodKeywords.map(kw => (
              <span key={kw} className="keyword-pill">{kw}</span>
            ))}
          </div>
        )}

        {/* Step progress dots */}
        <div className="loading-steps">
          {STEPS.map((s, i) => {
            const isDone    = i < currentStepIdx
            const isCurrent = i === currentStepIdx
            return (
              <div key={s.id} className="loading-step-item">
                <div className={`loading-step-dot ${isDone ? 'loading-step-done' : ''} ${isCurrent ? 'loading-step-active' : ''}`}>
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  ) : null}
                </div>
                <span className={`loading-step-text ${isCurrent ? 'loading-step-text-active' : ''}`}>
                  {s.label.replace('…', '')}
                </span>
              </div>
            )
          })}
        </div>

        {/* Rotating fun phrase */}
        <p className="loading-vibe-phrase" key={phraseIdx}>
          {VIBES_COPY[phraseIdx]}
        </p>
      </div>
    </div>
  )
}
