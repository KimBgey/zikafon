// ─────────────────────────────────────────────
//  Zikafon — Core TypeScript Interfaces
// ─────────────────────────────────────────────

export interface MoodAnalysis {
  raw: string               // texte original de l'user
  keywords: string[]
  energy: number            // 0-1  (0 = calme, 1 = énergique)
  valence: number           // 0-1  (0 = mélancolique, 1 = joyeux)
  tempo: 'slow' | 'medium' | 'fast'
  genres: string[]
  searchQuery: string
  createdAt: Date
}

export interface Track {
  id: string
  name: string
  artists: string[]
  albumCover: string
  previewUrl: string | null
  spotifyUrl: string
  duration_ms?: number
  popularity?: number
}

export interface VibeSession {
  id: string
  userId: string | null     // null si non connecté
  mood: MoodAnalysis
  tracks: Track[]
  liked: string[]           // track ids
  skipped: string[]         // track ids
  createdAt: Date
}

export type SwipeDirection = 'left' | 'right' | 'up' | null

export interface SwipeAction {
  trackId: string
  direction: SwipeDirection
  timestamp: Date
}

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export interface PlayerState {
  trackId: string | null
  status: PlayerStatus
  currentTime: number
  duration: number
  volume: number
}

// Spotify token (server-side only)
export interface SpotifyToken {
  access_token: string
  token_type: string
  expires_in: number
  expiresAt: number
}

// API response shapes
export interface AnalyzeResponse {
  success: boolean
  mood?: MoodAnalysis
  error?: string
}

export interface SearchResponse {
  success: boolean
  tracks?: Track[]
  error?: string
}

export interface PlaylistResponse {
  success: boolean
  playlistId?: string
  playlistUrl?: string
  error?: string
}

// UI state
export type AppStep = 'home' | 'loading' | 'swipe' | 'done'

export interface AppState {
  step: AppStep
  moodText: string
  mood: MoodAnalysis | null
  tracks: Track[]
  liked: string[]
  skipped: string[]
  sessionId: string | null
}
