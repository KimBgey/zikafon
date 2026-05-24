import { NextRequest, NextResponse } from 'next/server'
import { searchTracks } from '@/lib/deezer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body || typeof body.searchQuery !== 'string' || !body.searchQuery.trim()) {
      return NextResponse.json(
        { success: false, error: 'searchQuery requis.' },
        { status: 400 }
      )
    }

    const tracks = await searchTracks(body.searchQuery.trim(), body.limit ?? 5)

    if (tracks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucun titre trouvé pour ce mood.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, tracks })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/search]', message)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
