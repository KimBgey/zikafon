'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ZikafonLogo } from '@/components/ZikafonLogo'

const FEATURES = {
  free: [
    '3 recherches de vibe / jour',
    'Swipe & like des tracks',
    'Historique 7 jours',
    'Accès Deezer',
  ],
  pro: [
    'Recherches illimitées',
    'Historique complet',
    'Toutes les fonctionnalités Free',
    'Badge Vibe Pro ✨',
    'Support prioritaire',
  ],
  max: [
    'Tout Vibe Pro',
    'Stats d\'humeur avancées',
    'Recommandations personnalisées IA',
    'Export playlist Deezer',
    'Badge Vibe Max 🔥',
  ],
}

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<'pro' | 'max' | null>(null)

  async function handleUpgrade(plan: 'pro' | 'max') {
    if (!user) { router.push('/register'); return }

    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, plan, email: user.email }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error(err)
      setLoading(null)
    }
  }

  return (
    <main className="pricing-shell">
      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="aurora-blob animate-aurora blob-purple" />
        <div className="aurora-blob animate-aurora blob-pink" />
        <div className="aurora-blob animate-float-slow blob-orange" />
      </div>

      {/* Top bar */}
      <header className="pricing-topbar">
        <Link href={user ? '/home' : '/'} aria-label="Retour à l'accueil">
          <ZikafonLogo variant="full" size={30} />
        </Link>
      </header>

      <div className="pricing-content">
        <div className="pricing-hero animate-slide-up">
          <h1 className="pricing-title">
            Choisis ta <span className="text-gradient">vibe</span>
          </h1>
          <p className="pricing-subtitle">
            Commence gratuitement. Passe à Pro quand tu veux en faire plus.
          </p>
        </div>

        <div className="pricing-grid animate-slide-up delay-1">

          {/* ── Free ── */}
          <div className="pricing-card glass-card">
            <div className="pricing-card-header">
              <p className="pricing-plan-name">Free</p>
              <p className="pricing-plan-price">0€</p>
              <p className="pricing-plan-period">pour toujours</p>
            </div>
            <ul className="pricing-features">
              {FEATURES.free.map(f => (
                <li key={f} className="pricing-feature">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href={user ? '/home' : '/register'} className="pricing-cta-free">
              {user ? 'Ton plan actuel' : 'Commencer gratuitement'}
            </Link>
          </div>

          {/* ── Vibe Pro (highlighted) ── */}
          <div className="pricing-card pricing-card-pro glass-card">
            <div className="pricing-badge-popular">Le plus populaire</div>
            <div className="pricing-card-header">
              <p className="pricing-plan-name pricing-plan-name-pro">Vibe Pro</p>
              <p className="pricing-plan-price">4,99€</p>
              <p className="pricing-plan-period">par mois</p>
            </div>
            <ul className="pricing-features">
              {FEATURES.pro.map(f => (
                <li key={f} className="pricing-feature">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn-aurora w-full"
              onClick={() => handleUpgrade('pro')}
              disabled={loading !== null}
            >
              <span className="btn-aurora-inner">
                {loading === 'pro' ? 'Redirection…' : 'Passer à Pro'}
              </span>
            </button>
          </div>

          {/* ── Vibe Max ── */}
          <div className="pricing-card glass-card">
            <div className="pricing-card-header">
              <p className="pricing-plan-name pricing-plan-name-max">Vibe Max</p>
              <p className="pricing-plan-price">9,99€</p>
              <p className="pricing-plan-period">par mois</p>
            </div>
            <ul className="pricing-features">
              {FEATURES.max.map(f => (
                <li key={f} className="pricing-feature">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#f9a8d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="pricing-cta-max"
              onClick={() => handleUpgrade('max')}
              disabled={loading !== null}
            >
              {loading === 'max' ? 'Redirection…' : 'Passer à Max'}
            </button>
          </div>

        </div>

        <p className="pricing-note animate-slide-up delay-2">
          Paiement sécurisé par Stripe · Résiliable à tout moment · Sans engagement
        </p>
      </div>
    </main>
  )
}
