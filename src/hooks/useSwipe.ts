'use client'
import { useState, useCallback } from 'react'
import { Track, SwipeDirection } from '@/types'

interface UseSwipeProps {
  tracks: Track[]
  onLike?: (track: Track) => void
  onSkip?: (track: Track) => void
  onDone?: (liked: string[], skipped: string[]) => void
}

export function useSwipe({ tracks, onLike, onSkip, onDone }: UseSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<string[]>([])
  const [skipped, setSkipped] = useState<string[]>([])
  const [lastDirection, setLastDirection] = useState<SwipeDirection>(null)

  const currentTrack = tracks[currentIndex] ?? null
  const isDone = currentIndex >= tracks.length

  const swipe = useCallback(
    (direction: 'left' | 'right') => {
      if (!currentTrack) return

      setLastDirection(direction)

      if (direction === 'right') {
        setLiked((prev) => {
          const next = [...prev, currentTrack.id]
          return next
        })
        onLike?.(currentTrack)
      } else {
        setSkipped((prev) => {
          const next = [...prev, currentTrack.id]
          return next
        })
        onSkip?.(currentTrack)
      }

      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)

      if (nextIndex >= tracks.length) {
        const newLiked = direction === 'right'
          ? [...liked, currentTrack.id]
          : liked
        const newSkipped = direction === 'left'
          ? [...skipped, currentTrack.id]
          : skipped
        onDone?.(newLiked, newSkipped)
      }
    },
    [currentTrack, currentIndex, liked, skipped, tracks.length, onLike, onSkip, onDone]
  )

  const like = useCallback(() => swipe('right'), [swipe])
  const skip = useCallback(() => swipe('left'), [swipe])

  const reset = useCallback(() => {
    setCurrentIndex(0)
    setLiked([])
    setSkipped([])
    setLastDirection(null)
  }, [])

  return {
    currentTrack,
    currentIndex,
    liked,
    skipped,
    lastDirection,
    isDone,
    like,
    skip,
    reset,
    progress: tracks.length > 0 ? (currentIndex / tracks.length) * 100 : 0,
  }
}
