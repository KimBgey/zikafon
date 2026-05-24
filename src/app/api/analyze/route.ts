import { NextRequest, NextResponse } from 'next/server'
import { analyzeMood, RateLimitError } from '@/lib/gemini'
import { MoodAnalysis } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body || typeof body.text !== 'string' || body.text.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Texte trop court ou invalide.' },
        { status: 400 }
      )
    }

    if (body.text.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Texte trop long (500 chars max).' },
        { status: 400 }
      )
    }

    const result = await analyzeMood(body.text.trim())

    const mood: MoodAnalysis = {
      raw: body.text.trim(),
      ...result,
      createdAt: new Date(),
    }

    return NextResponse.json({ success: true, mood })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/analyze]', message)

    // Rate-limit → 429 with retryAfter so the client can show a countdown
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        {
          success: false,
          error: message,
          retryAfterMs: err.retryAfterMs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(err.retryAfterMs / 1000)),
          },
        }
      )
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
