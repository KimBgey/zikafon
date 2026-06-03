import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPlanInfo } from '@/lib/firestore'

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json()
    if (!uid) return NextResponse.json({ error: 'UID manquant.' }, { status: 400 })

    const { stripeCustomerId } = await getPlanInfo(uid)
    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'Aucun abonnement actif.' }, { status: 404 })
    }

    const origin = req.headers.get('origin') ?? 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer:   stripeCustomerId,
      return_url: `${origin}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[/api/stripe/portal]', err)
    return NextResponse.json({ error: 'Erreur portail.' }, { status: 500 })
  }
}
