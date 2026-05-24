import { NextRequest, NextResponse } from 'next/server'
import { addTracksToPlaylist, getOrCreateVibePlaylist } from '@/lib/spotify'

export async function POST(req: NextRequest) {
  try {
    const { accessToken, userId, trackIds } = await req.json()

    if (!accessToken || !userId || !Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'accessToken, userId et trackIds requis.' },
        { status: 400 }
      )
    }

    // Get or create the "Vibe Check" playlist
    const playlistId = await getOrCreateVibePlaylist(accessToken, userId)

    // Add liked tracks
    await addTracksToPlaylist(accessToken, playlistId, trackIds)

    const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`

    return NextResponse.json({ success: true, playlistId, playlistUrl })
  } catch (err) {
    console.error('[playlist]', err)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la sauvegarde en playlist.' },
      { status: 500 }
    )
  }
}
