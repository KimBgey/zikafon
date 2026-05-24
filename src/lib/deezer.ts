import { Track } from '@/types'

const DEEZER_BASE = 'https://api.deezer.com'

// Deezer Search — no API key, no auth, completely free
export async function searchTracks(
  query: string,
  limit = 5
): Promise<Track[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    order: 'RANKING',
  })

  const response = await fetch(`${DEEZER_BASE}/search?${params}`, {
    // Cache token for 5 min to avoid hammering the API
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`Deezer search HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(`Deezer API error: ${data.error.message ?? JSON.stringify(data.error)}`)
  }

  const items: DeezerTrack[] = data.data ?? []

  return items.map((item) => ({
    id:         String(item.id),
    name:       item.title,
    artists:    [item.artist.name],
    albumCover: item.album.cover_xl ?? item.album.cover_big ?? item.album.cover_medium ?? '',
    previewUrl: item.preview ?? null,       // 30s mp3, always present on Deezer
    spotifyUrl: item.link,                  // → opens Deezer instead
    duration_ms: (item.duration ?? 0) * 1000,
    popularity:  item.rank ?? 0,
  }))
}

// ── Deezer API types ──────────────────────────────────────────────────────
interface DeezerTrack {
  id: number
  title: string
  duration: number
  rank: number
  preview: string | null
  link: string
  artist: {
    id: number
    name: string
  }
  album: {
    id: number
    title: string
    cover_medium: string
    cover_big: string
    cover_xl: string
  }
}
