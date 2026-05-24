'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoodAnalysis, Track } from '@/types'
import { DeezerLink } from '@/components/DeezerLink'

interface SessionData {
  mood: MoodAnalysis
  tracks: Track[]
  liked: string[]
  skipped: string[]
  date: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    const rawMood    = sessionStorage.getItem('zikafon_mood')
    const rawTracks  = sessionStorage.getItem('zikafon_tracks')
    const rawLiked   = sessionStorage.getItem('zikafon_liked')
    const rawSkipped = sessionStorage.getItem('zikafon_skipped')

    if (rawMood && rawTracks) {
      setSession({
        mood:    JSON.parse(rawMood),
        tracks:  JSON.parse(rawTracks),
        liked:   rawLiked   ? JSON.parse(rawLiked)   : [],
        skipped: rawSkipped ? JSON.parse(rawSkipped) : [],
        date:    new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      })
      setHasData(true)
    }
  }, [])

  if (!hasData) {
    return (
      <main className="profile-shell">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="aurora-blob animate-aurora blob-purple" />
          <div className="aurora-blob animate-aurora blob-pink" />
        </div>
        <div className="profile-empty animate-scale-in">
          <div className="profile-empty-icon">🎵</div>
          <h1 className="profile-empty-title">Aucune session</h1>
          <p className="profile-empty-sub">Lance d&apos;abord une recherche de vibe pour voir ton profil musical.</p>
          <button type="button" className="btn-aurora" onClick={() => router.push('/')}>
            <span className="btn-aurora-inner">Trouver ma vibe</span>
          </button>
        </div>
      </main>
    )
  }

  const { mood, tracks, liked, skipped, date } = session!
  const likedTracks   = tracks.filter(t => liked.includes(t.id))
  const skippedTracks = tracks.filter(t => skipped.includes(t.id))
  const likeRate      = tracks.length > 0 ? Math.round((liked.length / tracks.length) * 100) : 0

  return (
    <main className="profile-shell">
      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="aurora-blob animate-aurora blob-purple" />
        <div className="aurora-blob animate-aurora blob-pink" />
        <div className="aurora-blob animate-float-slow blob-orange" />
      </div>

      <div className="profile-content animate-slide-up">

        {/* Header */}
        <header className="profile-header">
          <button
            type="button"
            className="results-back-btn"
            onClick={() => router.back()}
            aria-label="Retour"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="profile-title">Mon profil musical</h1>
            <p className="profile-date">{date}</p>
          </div>
          <button
            type="button"
            className="profile-new-btn"
            onClick={() => { sessionStorage.clear(); router.push('/') }}
            aria-label="Nouvelle session"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        </header>

        {/* Mood card */}
        <section className="glass-card profile-mood-card">
          <p className="profile-section-label">Ton mood</p>
          <blockquote className="profile-mood-quote">&ldquo;{mood.raw}&rdquo;</blockquote>

          {/* Keywords */}
          <div className="profile-keywords">
            {mood.keywords.map(k => (
              <span key={k} className="keyword-pill">{k}</span>
            ))}
            {mood.genres.map(g => (
              <span key={g} className="genre-pill">{g}</span>
            ))}
          </div>

          {/* Energy / Valence bars */}
          <div className="profile-bars">
            <ProfileBar label="Énergie" value={Math.round(mood.energy * 100)} color="#7C3AED" />
            <ProfileBar label="Humeur"  value={Math.round(mood.valence * 100)} color="#EC4899" />
          </div>

          <span className="tempo-badge" style={{ marginTop: '0.25rem' }}>
            {{ slow: '🐢 Doux', medium: '🎯 Équilibré', fast: '⚡ Rapide' }[mood.tempo]}
          </span>
        </section>

        {/* Stats row */}
        <div className="profile-stats-row">
          <div className="profile-stat-card">
            <span className="profile-stat-num profile-stat-green">{liked.length}</span>
            <span className="profile-stat-label">Aimés</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-num profile-stat-red">{skipped.length}</span>
            <span className="profile-stat-label">Passés</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-num profile-stat-purple">{likeRate}%</span>
            <span className="profile-stat-label">Taux like</span>
          </div>
        </div>

        {/* Liked tracks */}
        {likedTracks.length > 0 && (
          <section className="glass-card profile-track-section">
            <p className="profile-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Coups de cœur
            </p>
            <div className="profile-track-list">
              {likedTracks.map(track => (
                <TrackRow key={track.id} track={track} />
              ))}
            </div>
          </section>
        )}

        {/* Skipped tracks */}
        {skippedTracks.length > 0 && (
          <section className="glass-card profile-track-section">
            <p className="profile-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8"
                strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Passés
            </p>
            <div className="profile-track-list">
              {skippedTracks.map(track => (
                <TrackRow key={track.id} track={track} dimmed />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <button
          type="button"
          className="btn-aurora w-full"
          onClick={() => { sessionStorage.clear(); router.push('/') }}
        >
          <span className="btn-aurora-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            Nouvelle session vibe
          </span>
        </button>
      </div>
    </main>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function ProfileBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mood-bar-row">
      <span className="mood-bar-label">{label}</span>
      <div className="mood-bar-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="mood-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="mood-bar-pct">{value}%</span>
    </div>
  )
}

function TrackRow({ track, dimmed = false }: { track: Track; dimmed?: boolean }) {
  return (
    <div className={`profile-track-row${dimmed ? ' profile-track-dimmed' : ''}`}>
      {track.albumCover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.albumCover} alt="" className="profile-track-cover" aria-hidden="true" />
      ) : (
        <div className="profile-track-cover profile-track-cover-fallback" aria-hidden="true" />
      )}
      <div className="profile-track-info">
        <p className="profile-track-name">{track.name}</p>
        <p className="profile-track-artist">{track.artists[0]}</p>
      </div>
      <DeezerLink url={track.spotifyUrl} trackName={track.name} variant="pill" />
    </div>
  )
}
