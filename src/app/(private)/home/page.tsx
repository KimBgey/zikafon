'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MoodInput } from '@/components/MoodInput'
import { LoadingScreen, LoadingStep } from '@/components/LoadingScreen'
import { MoodAnalysis, Track } from '@/types'
import { useAuth } from '@/hooks/useAuth'

const SEARCHED_KEY = 'zikafon_searched_once'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('idle')
  const [moodKeywords, setMoodKeywords] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [retryIn, setRetryIn] = useState<number | null>(null)
  const [showGate, setShowGate] = useState(false)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check if anonymous user already used their free search
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      setShowGate(localStorage.getItem(SEARCHED_KEY) === '1')
    }
  }, [user])

  // Countdown timer for rate-limit
  useEffect(() => {
    if (retryIn === null) return
    if (retryIn <= 0) { setRetryIn(null); setError(null); return }
    countdownRef.current = setInterval(() => {
      setRetryIn(s => {
        if (s === null || s <= 1) { clearInterval(countdownRef.current!); setError(null); return null }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current!)
  }, [retryIn])

  const handleSubmit = useCallback(async (text: string) => {
    setError(null)
    setRetryIn(null)
    setMoodKeywords([])
    clearInterval(countdownRef.current!)

    try {
      // ── Step 1: Gemini analysis ──────────────────────────
      setLoadingStep('analyzing')

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const analyzeData = await analyzeRes.json()

      if (analyzeRes.status === 429) {
        const waitSec = analyzeData.retryAfterMs ? Math.ceil(analyzeData.retryAfterMs / 1000) : 60
        setRetryIn(waitSec)
        setError(`Quota Gemini atteint — réessaie dans ${waitSec}s`)
        setLoadingStep('idle')
        return
      }
      if (!analyzeData.success) throw new Error(analyzeData.error)

      const mood: MoodAnalysis = analyzeData.mood
      setMoodKeywords(mood.keywords.slice(0, 4))

      // ── Step 2: Deezer search ────────────────────────────
      setLoadingStep('searching')

      const searchRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: mood.searchQuery }),
      })
      const searchData = await searchRes.json()
      if (!searchData.success) throw new Error(searchData.error)

      const tracks: Track[] = searchData.tracks

      // ── Done — store & navigate ──────────────────────────
      sessionStorage.setItem('zikafon_mood',   JSON.stringify(mood))
      sessionStorage.setItem('zikafon_tracks', JSON.stringify(tracks))

      // Mark that the user has done their first search (used by the anonymous gate)
      if (!user) localStorage.setItem(SEARCHED_KEY, '1')

      setLoadingStep('done')
      await new Promise(r => setTimeout(r, 400))
      router.push('/results')
    } catch (err) {
      setLoadingStep('idle')
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }, [router])

  const fillExample = (text: string) => {
    const textarea = document.querySelector<HTMLTextAreaElement>('.mood-textarea')
    if (textarea) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
      setter?.call(textarea, text)
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  const isLoading = loadingStep !== 'idle'

  // ── Gate screen: anonymous user trying their 2nd search ───────────────────
  if (showGate) {
    return (
      <main className="home-main relative flex flex-col items-center justify-center px-4 py-12">
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="aurora-blob animate-aurora blob-purple" />
          <div className="aurora-blob animate-aurora blob-pink" />
          <div className="aurora-blob animate-float-slow blob-orange" />
        </div>
        <div className="gate-card glass-card animate-scale-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" aria-hidden="true" width={72} height={72} className="mascot-brand" />
          <h1 className="gate-title">
            <span className="text-gradient">Tu as aimé l&apos;expérience ?</span>
          </h1>
          <p className="gate-desc">
            Crée ton compte gratuit pour refaire une recherche de vibe, sauvegarder tes coups de cœur et accéder à ton historique.
          </p>
          <Link href="/register" className="btn-aurora w-full">
            <span className="btn-aurora-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Créer mon compte — c&apos;est gratuit
            </span>
          </Link>
          <Link href="/login" className="gate-login-link">
            J&apos;ai déjà un compte →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      {/* ── Full-screen loading overlay ── */}
      <LoadingScreen step={loadingStep} moodKeywords={moodKeywords} />

      <main className="home-main relative flex flex-col items-center justify-center overflow-hidden px-4 pt-12">

        {/* Aurora blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="aurora-blob animate-aurora blob-purple" />
          <div className="aurora-blob animate-aurora blob-pink" />
          <div className="aurora-blob animate-float-slow blob-orange" />
        </div>

        {/* Floating music notes */}
        <div className="music-notes-wrap" aria-hidden="true">
          <span className="music-note note-1">♪</span>
          <span className="music-note note-2">♫</span>
          <span className="music-note note-3">♩</span>
          <span className="music-note note-4">♬</span>
          <span className="music-note note-5">♭</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center gap-7">

          {/* Brand */}
          <div className="text-center animate-slide-up">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" aria-hidden="true" width={80} height={80} className="mascot-brand" />
            <h1 className="brand-title"><span className="text-gradient">Zikafon</span></h1>
            <p className="brand-subtitle">
              Décris comment tu te sens.{' '}
              <span className="brand-subtitle-accent">On trouve ta vibe.</span>
            </p>
          </div>

          {/* Rate-limit banner */}
          {retryIn !== null && (
            <div className="rate-limit-banner animate-scale-in">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"/>
              </svg>
              <span>Quota Gemini atteint — disponible dans</span>
              <span className="rate-limit-countdown">{retryIn}s</span>
            </div>
          )}

          {/* Input card */}
          <div className="glass-card w-full p-5 animate-slide-up delay-1">
            <MoodInput
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={retryIn !== null ? null : error}
              disabled={retryIn !== null}
            />
          </div>

          {/* Quick examples */}
          <div className="flex flex-wrap gap-2 justify-center animate-slide-up delay-2">
            {[
              { emoji: '😴', text: 'Pas encore réveillé' },
              { emoji: '🔥', text: 'Hype du week-end' },
              { emoji: '💔', text: 'Post-break up triste' },
              { emoji: '🌊', text: 'Chill plage soleil' },
              { emoji: '💪', text: 'Séance sport intense' },
              { emoji: '🌧', text: 'Mélancolie douce' },
            ].map(({ emoji, text }) => (
              <button
                type="button"
                key={text}
                onClick={() => fillExample(text)}
                className="example-chip"
                disabled={isLoading}
              >
                {emoji} {text}
              </button>
            ))}
          </div>

          {/* How it works */}
          <div className="w-full grid grid-cols-3 gap-2.5 animate-slide-up delay-3">
            <div className="step-card">
              <span role="img" aria-label="écrire">✍️</span>
              <span className="step-label step-label-purple">Décris ton mood</span>
            </div>
            <div className="step-card">
              <span role="img" aria-label="IA">✨</span>
              <span className="step-label step-label-pink">IA analyse ta vibe</span>
            </div>
            <div className="step-card">
              <span role="img" aria-label="musique">🎵</span>
              <span className="step-label step-label-orange">Swipe les tracks</span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
