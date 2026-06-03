import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, type PlanId } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { uid, plan, email } = await req.json()

    if (!uid || !plan || !['pro', 'max'].includes(plan)) {
      return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 })
    }

    const priceId = PLANS[plan as PlanId].priceId
    if (!priceId) {
      return NextResponse.json({ error: 'Plan non configuré.' }, { status: 500 })
    }

    const origin = req.headers.get('origin') ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/settings?upgraded=true`,
      cancel_url:  `${origin}/pricing`,
      customer_email: email,
      metadata: { uid },
      subscription_data: { metadata: { uid } },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[/api/stripe/checkout]', err)
    return NextResponse.json({ error: 'Erreur lors de la création du paiement.' }, { status: 500 })
  }
}
