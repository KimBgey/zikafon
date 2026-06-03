import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import type Stripe from 'stripe'

const USERS = 'zikafon_users'

// Maps a Stripe subscription status + plan name to our PlanId
function planFromSubscription(sub: Stripe.Subscription): 'free' | 'pro' | 'max' {
  if (sub.status !== 'active' && sub.status !== 'trialing') return 'free'
  const priceId = sub.items.data[0]?.price.id
  if (priceId === process.env.STRIPE_PRICE_MAX) return 'max'
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro'
  return 'free'
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return new Response('Missing signature', { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] signature verification failed', err)
    return new Response(`Webhook Error: ${err}`, { status: 400 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const uid = session.metadata?.uid
        if (!uid || session.mode !== 'subscription') break

        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const plan = planFromSubscription(sub)

        await adminDb.collection(USERS).doc(uid).set({
          plan,
          stripeCustomerId:     session.customer,
          stripeSubscriptionId: session.subscription,
        }, { merge: true })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const uid = sub.metadata?.uid
        if (!uid) break

        const plan = planFromSubscription(sub)
        await adminDb.collection(USERS).doc(uid).set({ plan }, { merge: true })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const uid = sub.metadata?.uid
        if (!uid) break

        await adminDb.collection(USERS).doc(uid).set({
          plan: 'free',
          stripeSubscriptionId: null,
        }, { merge: true })
        break
      }
    }
  } catch (err) {
    console.error('[webhook] handler error', err)
    return new Response('Handler error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
