'use client'
import { usePlayer } from '@/hooks/usePlayer'
import { Track } from '@/types'

interface TrackPreviewProps {
  track: Track
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function TrackPreview({ track }: TrackPreviewProps) {
  const { play, stop, playingId, status, currentTime, duration, seek } = usePlayer()
  const isThis = playingId === track.id
  const isPlaying = isThis && status === 'playing'
  const isLoading = isThis && status === 'loading'
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!track.previewUrl) {
    return (
      <span className="no-preview-badge" aria-label="Aperçu non disponible">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
        Pas de preview
      </span>
    )
  }

  const handleClick = () => {
    if (isThis) {
      if (isPlaying) stop()
      else play(track.id, track.previewUrl!)
    } else {
      play(track.id, track.previewUrl!)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isThis) return
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seek(ratio * duration)
  }

  return (
    <div className="track-preview-wrap">
      <div className="track-preview-controls">
        <button
          type="button"
          className={`play-btn${isLoading ? ' play-btn-loading' : ''}`}
          onClick={handleClick}
          aria-label={isPlaying ? 'Pause preview' : 'Écouter preview'}
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="mood-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
            </svg>
          ) : isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div
            className="audio-progress"
            role="slider"
            aria-label="Progression audio"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            onClick={handleSeek}
          >
            <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="track-preview-times">
            <span>{isThis ? formatTime(currentTime) : '0:00'}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
