'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getSessions, MoodSessionDoc } from '@/lib/firestore'
import { DeezerLink } from '@/components/DeezerLink'

export default function HistoryPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<MoodSessionDoc[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getSessions(user.uid)
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <main className="history-shell">
        <HistoryHeader />
        <div className="history-list">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 96, borderRadius: '1rem' }} />
          ))}
        </div>
      </main>
    )
  }

  if (sessions.length === 0) {
    return (
      <main className="history-shell">
        <HistoryHeader />
        <div className="history-empty">
          <div className="history-empty-icon">🎵</div>
          <p className="history-empty-title">Aucune session encore</p>
          <p className="history-empty-sub">Lance ta première recherche de vibe !</p>
        </div>
      </main>
    )
  }

  return (
    <main className="history-shell">
      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="aurora-blob animate-aurora blob-purple" style={{ opacity: 0.3 }} />
        <div className="aurora-blob animate-aurora blob-pink" style={{ opacity: 0.2 }} />
      </div>

      <HistoryHeader />

      <div className="history-list">
        {sessions.map((s) => (
          <SessionCard
            key={s.sessionId}
            session={s}
            isExpanded={expanded === s.sessionId}
            onToggle={() => setExpanded(p => p === s.sessionId ? null : s.sessionId)}
          />
        ))}
      </div>
    </main>
  )
}

function HistoryHeader() {
  return (
    <header className="history-header">
      <h1 className="history-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Mes sessions
      </h1>
    </header>
  )
}

interface SessionCardProps {
  session: MoodSessionDoc
  isExpanded: boolean
  onToggle: () => void
}

function SessionCard({ session, isExpanded, onToggle }: SessionCardProps) {
  const date = session.createdAt
    ? new Date((session.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  const likedTracks  = session.tracks.filter(t => session.likedTrackIds.includes(t.id))
  const likeRate     = session.tracks.length > 0
    ? Math.round((session.likedTrackIds.length / session.tracks.length) * 100)
    : 0

  const tempoLabel: Record<string, string> = { slow: '🐢 Doux', medium: '🎯 Équilibré', fast: '⚡ Rapide' }

  return (
    <article className="session-card glass-card">
      <button
        type="button"
        className="session-card-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="session-card-left">
          <p className="session-date">{date}</p>
          <p className="session-mood-text">
            &ldquo;{session.moodText.length > 60
              ? `${session.moodText.slice(0, 60)}…`
              : session.moodText}&rdquo;
          </p>
          <div className="session-pills">
            {session.keywords.slice(0, 3).map(k => (
              <span key={k} className="keyword-pill">{k}</span>
            ))}
            {session.tempo && (
              <span className="tempo-badge">{tempoLabel[session.tempo] ?? session.tempo}</span>
            )}
          </div>
        </div>

        <div className="session-card-right">
          <div className="session-stats">
            <span className="session-stat-green">{session.likedTrackIds.length}♥</span>
            <span className="session-stat-pct">{likeRate}%</span>
          </div>
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`session-chevron${isExpanded ? ' session-chevron-open' : ''}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {isExpanded && likedTracks.length > 0 && (
        <div className="session-liked-list">
          <p className="session-liked-label">Coups de cœur</p>
          {likedTracks.map(track => (
            <div key={track.id} className="session-liked-row">
              {track.albumCover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.albumCover} alt="" className="session-liked-cover" aria-hidden="true" />
              ) : (
                <div className="session-liked-cover session-liked-cover-fallback" aria-hidden="true" />
              )}
              <div className="session-liked-info">
                <p className="session-liked-name">{track.name}</p>
                <p className="session-liked-artist">{track.artists[0]}</p>
              </div>
              <DeezerLink url={track.spotifyUrl} trackName={track.name} variant="icon" />
            </div>
          ))}
        </div>
      )}

      {isExpanded && likedTracks.length === 0 && (
        <p className="session-no-likes">Aucun coup de cœur dans cette session.</p>
      )}
    </article>
  )
}
