'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { PlayerStatus } from '@/types'

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(30) // Spotify preview = 30s

  // Clean up on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const play = useCallback((trackId: string, previewUrl: string) => {
    // Same track — toggle play/pause
    if (playingId === trackId) {
      if (status === 'playing') {
        audioRef.current?.pause()
        setStatus('paused')
      } else {
        audioRef.current?.play().catch(() => setStatus('error'))
        setStatus('playing')
      }
      return
    }

    // New track — stop previous
    audioRef.current?.pause()

    const audio = new Audio(previewUrl)
    audioRef.current = audio
    setPlayingId(trackId)
    setStatus('loading')
    setCurrentTime(0)

    audio.addEventListener('canplay', () => {
      setDuration(audio.duration || 30)
      audio.play().catch(() => setStatus('error'))
      setStatus('playing')
    })

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      setStatus('idle')
      setCurrentTime(0)
      setPlayingId(null)
    })

    audio.addEventListener('error', () => {
      setStatus('error')
    })
  }, [playingId, status])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setStatus('paused')
  }, [])

  const stop = useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null
    setPlayingId(null)
    setStatus('idle')
    setCurrentTime(0)
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  return {
    playingId,
    status,
    currentTime,
    duration,
    play,
    pause,
    stop,
    seek,
    isPlaying: (id: string) => playingId === id && status === 'playing',
    isLoading: (id: string) => playingId === id && status === 'loading',
  }
}
