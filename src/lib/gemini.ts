import { MoodAnalysis } from '@/types'

// Models confirmed available on this API key (from ListModels).
// Ordered: lightest/most-available first, heavier last.
// flash-lite has 30 RPM vs 15 RPM for flash — try it first.
const MODELS = [
  'gemini-2.0-flash-lite',    // 30 RPM · 1 500 RPD free tier
  'gemini-2.0-flash-001',     // pinned version — separate quota bucket
  'gemini-flash-lite-latest', // rolling alias for lite
  'gemini-flash-latest',      // rolling alias for flash
  'gemini-2.0-flash',         // already hit daily quota but keep as last resort
]

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const SYSTEM_PROMPT = `Tu es un expert en musique. L'utilisateur décrit son humeur.
Retourne UNIQUEMENT un JSON valide, sans markdown, sans backticks, sans texte autour :
{
  "keywords": ["mot1", "mot2", "mot3"],
  "energy": 0.7,
  "valence": 0.5,
  "tempo": "medium",
  "genres": ["pop", "electronic"],
  "searchQuery": "artist or style for Spotify"
}
Règles strictes :
- energy  : float 0.0–1.0 (0 = calme, 1 = énergique)
- valence : float 0.0–1.0 (0 = mélancolique, 1 = joyeux)
- tempo   : EXACTEMENT "slow" | "medium" | "fast"
- genres  : 1–3 genres musicaux Spotify valides en anglais
- searchQuery : courte requête en anglais pour Spotify
Réponds uniquement avec le JSON brut.`

// ── Custom error for rate limits ─────────────────────────────────────────
export class RateLimitError extends Error {
  retryAfterMs: number
  constructor(retryAfterMs: number) {
    super(`Quota Gemini dépassé. Réessaie dans ${Math.ceil(retryAfterMs / 1000)}s.`)
    this.name = 'RateLimitError'
    this.retryAfterMs = retryAfterMs
  }
}

// ── Single model call ────────────────────────────────────────────────────
async function callGemini(model: string, text: string, key: string): Promise<string> {
  const url = `${BASE}/${model}:generateContent?key=${key}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 256,
        responseMimeType: 'application/json',
      },
    }),
  })

  // 429 → parse retryDelay and throw RateLimitError
  if (res.status === 429) {
    const errData = await res.json().catch(() => ({}))
    const retryDetail = errData?.error?.details?.find(
      (d: { '@type': string }) =>
        d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    ) as { retryDelay?: string } | undefined
    const retrySeconds = retryDetail?.retryDelay
      ? parseFloat(retryDetail.retryDelay.replace('s', ''))
      : 60
    throw new RateLimitError(retrySeconds * 1000)
  }

  // 404 → model not available, try next
  if (res.status === 404) {
    throw new Error(`model_not_found:${model}`)
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '(no body)')
    throw new Error(`Gemini ${model} HTTP ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const candidate = data.candidates?.[0]

  if (!candidate) {
    const feedback = JSON.stringify(data.promptFeedback ?? {})
    throw new Error(`Gemini ${model}: no candidate. promptFeedback=${feedback}`)
  }

  const finishReason: string = candidate.finishReason ?? 'STOP'
  if (!['STOP', 'MAX_TOKENS'].includes(finishReason)) {
    throw new Error(`Gemini ${model} blocked: finishReason=${finishReason}`)
  }

  const raw: string = candidate.content?.parts?.[0]?.text ?? ''
  if (!raw.trim()) throw new Error(`Gemini ${model}: empty response`)
  return raw
}

// ── Parse raw text into structured mood fields ───────────────────────────
function parseResponse(raw: string, fallback: string): Omit<MoodAnalysis, 'raw' | 'createdAt'> {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned) // throws if invalid — caller handles it

  return {
    keywords:    Array.isArray(parsed.keywords)        ? parsed.keywords.slice(0, 5) : [],
    energy:      clamp(parsed.energy   ?? 0.5),
    valence:     clamp(parsed.valence  ?? 0.5),
    tempo:       (['slow', 'medium', 'fast'] as const).includes(parsed.tempo)
                   ? parsed.tempo : 'medium',
    genres:      Array.isArray(parsed.genres)          ? parsed.genres.slice(0, 3)  : [],
    searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : fallback,
  }
}

// ── Public: try each model in order ─────────────────────────────────────
export async function analyzeMood(
  text: string
): Promise<Omit<MoodAnalysis, 'raw' | 'createdAt'>> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY manquant dans .env.local')

  let lastRateLimit: RateLimitError | null = null

  for (const model of MODELS) {
    try {
      const raw = await callGemini(model, text, key)
      const result = parseResponse(raw, text)
      console.log(`[Gemini] ✓ ${model}`)
      return result
    } catch (err) {
      if (err instanceof RateLimitError) {
        console.warn(`[Gemini] 429 ${model} — next…`)
        lastRateLimit = err
        continue
      }
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.startsWith('model_not_found:')) {
        console.warn(`[Gemini] 404 ${model} — next…`)
        continue
      }
      throw err // unexpected error — surface immediately
    }
  }

  throw lastRateLimit ?? new Error('Tous les modèles Gemini ont échoué')
}

const clamp = (n: unknown) => Math.max(0, Math.min(1, Number(n) || 0.5))
