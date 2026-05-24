'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { SwipeCard } from '@/components/SwipeCard'
import { MoodBadge } from '@/components/MoodBadge'
import { DeezerLink } from '@/components/DeezerLink'
import { useSwipe } from '@/hooks/useSwipe'
import { MoodAnalysis, Track } from '@/types'
import { auth } from '@/lib/firebase'
import { saveSession, saveLikedTrack } from '@/lib/firestore'

export default function ResultsPage() {
  const router = useRouter()
  const [mood, setMood]       = useState<MoodAnalysis | null>(null)
  const [tracks, setTracks]   = useState<Track[]>([])
  const [ready, setReady]     = useState(false)
  const [showMood, setShowMood] = useState(false)

  useEffect(() => {
    const rawMood   = sessionStorage.getItem('zikafon_mood')
    const rawTracks = sessionStorage.getItem('zikafon_tracks')
    if (!rawMood || !rawTracks) { router.replace('/home'); return }
    setMood(JSON.parse(rawMood))
    setTracks(JSON.parse(rawTracks))
    setReady(true)
  }, [router])

  const { currentIndex, liked, skipped, isDone, like, skip, progress } = useSwipe({
    tracks,
    onDone: (l, s) => {
      sessionStorage.setItem('zikafon_liked',   JSON.stringify(l))
      sessionStorage.setItem('zikafon_skipped', JSON.stringify(s))

      // ── Fire-and-forget Firestore save (only for authenticated users) ──
      const currentUser = auth.currentUser
      if (currentUser && mood) {
        saveSession(currentUser.uid, mood, tracks, l, s).catch(console.error)
        l.forEach(trackId => {
          const track = tracks.find(t => t.id === trackId)
          if (track) saveLikedTrack(currentUser.uid, track, mood.raw).catch(console.error)
        })
      }
    },
  })

  if (!ready || !mood) return <ResultsLoading />

  if (isDone) {
    return (
      <DoneScreen
        liked={liked}
        skipped={skipped}
        tracks={tracks}
        onRestart={() => { sessionStorage.clear(); router.push('/home') }}
        onProfile={() => router.push('/profile')}
      />
    )
  }

  const visibleTracks = tracks.slice(currentIndex, currentIndex + 3)

  return (
    <main className="results-shell">

      {/* Aurora blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="aurora-blob animate-aurora blob-purple results-blob-purple" />
        <div className="aurora-blob animate-aurora blob-pink results-blob-pink" />
      </div>

      {/* Header */}
      <header className="results-header">
        <button
          type="button"
          className="results-back-btn"
          onClick={() => router.push('/home')}
          aria-label="Retour à l'accueil"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <h1 className="results-title">Ta vibe</h1>

        <button
          type="button"
          className="results-info-btn"
          onClick={() => setShowMood(v => !v)}
          aria-label="Voir l'analyse du mood"
          aria-expanded={showMood ? 'true' : 'false'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </button>
      </header>

      {/* Mood panel (collapsible) */}
      <AnimatePresence>
        {showMood && (
          <motion.div
            className="glass-card p-4 results-mood-panel"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="results-mood-raw">&ldquo;{mood.raw}&rdquo;</p>
            <MoodBadge mood={mood} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="results-progress-wrap">
        <div className="results-progress-bar">
          <div
            className="results-progress-fill"
            style={{ width: `${progress}%` } as React.CSSProperties}
          />
        </div>
        <p className="results-counter">
          {currentIndex + 1} / {tracks.length}
        </p>
      </div>

      {/* Card stack */}
      <div className="results-cards-wrap">
        <div className="results-card-stack">
          <AnimatePresence>
            {visibleTracks.map((track, i) => {
              const isTop  = i === 0
              const offset = i * 6
              return (
                <motion.div
                  key={track.id}
                  className="results-card-motion"
                  style={{
                    top: `${offset}px`,
                    zIndex: 10 - i,
                    scale: 1 - i * 0.04,
                  } as React.CSSProperties}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1 - i * 0.04, opacity: 1 }}
                  exit={{ x: 400, opacity: 0, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.3 }}
                >
                  <SwipeCard
                    track={track}
                    onLike={like}
                    onSkip={skip}
                    isTop={isTop}
                    zIndex={10 - i}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="swipe-actions">
          <button
            type="button"
            className="action-btn action-skip"
            onClick={skip}
            aria-label="Passer ce titre"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <button
            type="button"
            className="action-btn action-like"
            onClick={like}
            aria-label="Liker ce titre"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Swipe hint */}
        <p className="swipe-hint">
          Swipe à droite pour liker · à gauche pour passer
        </p>
      </div>
    </main>
  )
}

/* ── Loading skeleton ── */
function ResultsLoading() {
  return (
    <div className="results-loading">
      <div className="skeleton results-loading-title" />
      <div className="skeleton results-loading-card" />
      <div className="results-loading-btns">
        <div className="skeleton results-loading-btn" />
        <div className="skeleton results-loading-btn" />
      </div>
    </div>
  )
}

/* ── Done screen ── */
interface DoneScreenProps {
  liked: string[]
  skipped: string[]
  tracks: Track[]
  onRestart: () => void
  onProfile: () => void
}

function DoneScreen({ liked, skipped, tracks, onRestart, onProfile }: DoneScreenProps) {
  const likedTracks = tracks.filter(t => liked.includes(t.id))

  return (
    <main className="done-shell">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="aurora-blob animate-aurora blob-purple" />
        <div className="aurora-blob animate-aurora blob-pink results-done-blob-pink" />
      </div>

      <div className="done-screen animate-scale-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" aria-hidden="true" width={56} height={56} className="mascot-done" />

        <h2 className="done-title">
          <span className="text-gradient">Ta session vibe</span>
        </h2>

        <div className="done-stats">
          <div className="done-stat">
            <span className="done-stat-num done-stat-num-green">{liked.length}</span>
            <span className="done-stat-label">Aimés</span>
          </div>
          <div className="done-stat">
            <span className="done-stat-num done-stat-num-red">{skipped.length}</span>
            <span className="done-stat-label">Passés</span>
          </div>
        </div>

        {likedTracks.length > 0 && (
          <div className="done-liked-list glass-card p-4 w-full">
            <p className="done-liked-title">Tes coups de cœur</p>
            {likedTracks.map(track => (
              <div key={track.id} className="done-liked-item">
                {track.albumCover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={track.albumCover} alt="" className="done-liked-cover" aria-hidden="true" />
                )}
                <div className="done-liked-info">
                  <p className="done-liked-name">{track.name}</p>
                  <p className="done-liked-artist">{track.artists[0]}</p>
                </div>
                <DeezerLink url={track.spotifyUrl} trackName={track.name} variant="icon" />
              </div>
            ))}
          </div>
        )}

        <button type="button" className="btn-aurora w-full" onClick={onRestart}>
          <span className="btn-aurora-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Nouvelle session
          </span>
        </button>

        <button type="button" className="done-profile-btn" onClick={onProfile}>
          Voir mon profil musical
        </button>
      </div>
    </main>
  )
}
