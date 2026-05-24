import { Track, SpotifyToken } from '@/types'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!

// ── Token cache (in-memory, server-side only) ──────────────────────────────
let tokenCache: SpotifyToken | null = null

async function getClientToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.access_token
  }

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Spotify token error: ${response.status}`)
  }

  const data = await response.json()
  tokenCache = {
    access_token: data.access_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return tokenCache.access_token
}

// ── Search tracks (no user auth needed) ───────────────────────────────────
export async function searchTracks(
  query: string,
  limit = 5,
  market = 'FR'
): Promise<Track[]> {
  const token = await getClientToken()

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(limit),
    market,
  })

  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Spotify search error: ${response.status}`)
  }

  const data = await response.json()
  const items = data.tracks?.items ?? []

  return items.map((item: SpotifyTrackItem) => ({
    id: item.id,
    name: item.name,
    artists: item.artists.map((a: { name: string }) => a.name),
    albumCover:
      item.album?.images?.[0]?.url ?? '/placeholder-album.jpg',
    previewUrl: item.preview_url,
    spotifyUrl: item.external_urls?.spotify ?? '',
    duration_ms: item.duration_ms,
    popularity: item.popularity,
  }))
}

// ── Add tracks to a playlist (requires user auth token) ───────────────────
export async function addTracksToPlaylist(
  userAccessToken: string,
  playlistId: string,
  trackIds: string[]
): Promise<void> {
  const uris = trackIds.map((id) => `spotify:track:${id}`)

  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris }),
    }
  )

  if (!response.ok) {
    throw new Error(`Spotify playlist add error: ${response.status}`)
  }
}

// ── Get or create "Vibe Check" playlist ───────────────────────────────────
export async function getOrCreateVibePlaylist(
  userAccessToken: string,
  userId: string
): Promise<string> {
  // List user playlists
  const listRes = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
    headers: { Authorization: `Bearer ${userAccessToken}` },
  })

  if (!listRes.ok) throw new Error('Cannot fetch playlists')

  const listData = await listRes.json()
  const existing = listData.items?.find(
    (p: { name: string }) => p.name === 'Vibe Check 🎵'
  )

  if (existing) return existing.id

  // Create playlist
  const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Vibe Check 🎵',
      description: 'Mes vibes Zikafon — musique selon mes humeurs',
      public: false,
    }),
  })

  if (!createRes.ok) throw new Error('Cannot create playlist')
  const createData = await createRes.json()
  return createData.id
}

// ── Types helpers ─────────────────────────────────────────────────────────
interface SpotifyTrackItem {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    images: { url: string; width: number; height: number }[]
  }
  preview_url: string | null
  external_urls: { spotify: string }
  duration_ms: number
  popularity: number
}
