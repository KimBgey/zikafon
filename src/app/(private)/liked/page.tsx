'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getLikedTracks, removeLikedTrack, LikedTrackDoc } from '@/lib/firestore'
import { DeezerLink } from '@/components/DeezerLink'

export default function LikedPage() {
  const { user } = useAuth()
  const [tracks, setTracks] = useState<LikedTrackDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getLikedTracks(user.uid)
      .then(setTracks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  async function handleRemove(trackId: string) {
    if (!user) return
    setRemoving(trackId)
    try {
      await removeLikedTrack(user.uid, trackId)
      setTracks(prev => prev.filter(t => t.trackId !== trackId))
    } catch (err) {
      console.error(err)
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return (
      <main className="liked-shell">
        <LikedHeader count={0} />
        <div className="liked-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: '1rem' }} />
          ))}
        </div>
      </main>
    )
  }

  if (tracks.length === 0) {
    return (
      <main className="liked-shell">
        <LikedHeader count={0} />
        <div className="liked-empty">
          <div className="liked-empty-icon">💔</div>
          <p className="liked-empty-title">Aucune track aimée</p>
          <p className="liked-empty-sub">Swipe à droite sur les tracks que tu kiffes !</p>
        </div>
      </main>
    )
  }

  return (
    <main className="liked-shell">
      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="aurora-blob animate-aurora blob-pink" style={{ opacity: 0.25 }} />
        <div className="aurora-blob animate-aurora blob-purple" style={{ opacity: 0.2, animationDelay: '2s' }} />
      </div>

      <LikedHeader count={tracks.length} />

      <div className="liked-list">
        {tracks.map((track) => {
          const date = track.likedAt
            ? new Date((track.likedAt as { seconds: number }).seconds * 1000).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short',
              })
            : '—'

          return (
            <div key={track.trackId} className="liked-row glass-card">
              {track.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.cover} alt="" className="liked-cover" aria-hidden="true" />
              ) : (
                <div className="liked-cover liked-cover-fallback" aria-hidden="true" />
              )}

              <div className="liked-info">
                <p className="liked-track-name">{track.title}</p>
                <p className="liked-track-artist">{track.artist}</p>
                {track.moodContext && (
                  <p className="liked-mood-context">&ldquo;{track.moodContext.slice(0, 40)}&rdquo;</p>
                )}
                <p className="liked-date">{date}</p>
              </div>

              <div className="liked-actions">
                <DeezerLink url={track.deezerUrl} trackName={track.title} variant="icon" />
                <button
                  type="button"
                  className="liked-remove-btn"
                  onClick={() => handleRemove(track.trackId)}
                  disabled={removing === track.trackId}
                  aria-label={`Retirer ${track.title} des aimés`}
                >
                  {removing === track.trackId ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="animate-spin" aria-hidden="true">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

function LikedHeader({ count }: { count: number }) {
  return (
    <header className="liked-header">
      <h1 className="liked-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        Mes coups de cœur
      </h1>
      {count > 0 && <span className="liked-count">{count} track{count > 1 ? 's' : ''}</span>}
    </header>
  )
}
