'use client'
import { useRef } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Track } from '@/types'
import { TrackPreview } from './TrackPreview'
import { DeezerLink } from './DeezerLink'

interface SwipeCardProps {
  track: Track
  onLike: () => void
  onSkip: () => void
  isTop: boolean
  zIndex: number
}

const SWIPE_THRESHOLD = 100

export function SwipeCard({ track, onLike, onSkip, isTop, zIndex }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate      = useTransform(x, [-300, 0, 300], [-20, 0, 20])
  const likeOpacity = useTransform(x, [20, 100],      [0, 1])
  const skipOpacity = useTransform(x, [-100, -20],    [1, 0])
  const cardOpacity = useTransform(x, [-300, -200, 0, 200, 300], [0, 1, 1, 1, 0])
  const scale       = useTransform(x, [-200, 0, 200], [0.92, 1, 0.92])

  const constraintsRef = useRef(null)

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD)  onLike()
    else if (info.offset.x < -SWIPE_THRESHOLD) onSkip()
  }

  return (
    <motion.div
      ref={constraintsRef}
      className="swipe-card-wrap"
      style={{
        x, rotate, opacity: cardOpacity, scale,
        zIndex,
        position: isTop ? 'relative' : 'absolute',
        top:      isTop ? 'auto' : '0',
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: -400, right: 400 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Album cover — native <img> avoids next/image hostname whitelist issues */}
      {track.albumCover ? (
        <div className="swipe-card-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.albumCover}
            alt={`Pochette de ${track.name}`}
            className="swipe-card-img"
          />
        </div>
      ) : (
        <div className="swipe-card-img-wrap swipe-card-img-fallback" />
      )}

      {/* Dark gradient overlay */}
      <div className="swipe-card-overlay" />

      {/* LIKE indicator */}
      <motion.div
        className="swipe-indicator swipe-like-indicator"
        style={{ opacity: likeOpacity }}
        aria-hidden="true"
      >
        LIKE
      </motion.div>

      {/* SKIP indicator */}
      <motion.div
        className="swipe-indicator swipe-skip-indicator"
        style={{ opacity: skipOpacity }}
        aria-hidden="true"
      >
        SKIP
      </motion.div>

      {/* Card content */}
      <div className="swipe-card-content">
        <p className="swipe-card-track-name">{track.name}</p>
        <p className="swipe-card-artists">{track.artists.join(', ')}</p>

        {isTop && <TrackPreview track={track} />}

        {isTop && (
          <div className="mt-3">
            <DeezerLink url={track.spotifyUrl} trackName={track.name} variant="pill" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
