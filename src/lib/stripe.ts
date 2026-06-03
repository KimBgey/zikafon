import Stripe from 'stripe'

// Server-side Stripe client — never exposed to the browser
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export type PlanId = 'free' | 'pro' | 'max'

export const PLANS: Record<PlanId, {
  label: string
  price: string
  priceId: string | null
  dailyLimit: number   // -1 = unlimited
  color: string
}> = {
  free: {
    label: 'Free',
    price: '0€',
    priceId: null,
    dailyLimit: 3,
    color: '#475569',
  },
  pro: {
    label: 'Vibe Pro',
    price: '4,99€/mois',
    priceId: process.env.STRIPE_PRICE_PRO ?? '',
    dailyLimit: -1,
    color: '#7C3AED',
  },
  max: {
    label: 'Vibe Max',
    price: '9,99€/mois',
    priceId: process.env.STRIPE_PRICE_MAX ?? '',
    dailyLimit: -1,
    color: '#EC4899',
  },
}
