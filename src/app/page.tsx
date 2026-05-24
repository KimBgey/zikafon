'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ZikafonLogo } from '@/components/ZikafonLogo'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.replace('/home')
  }, [user, loading, router])

  if (loading || user) {
    return <div className="auth-loading-screen"><div className="auth-spinner" /></div>
  }

  return (
    <div className="landing-root">
      {/* ── Aurora background ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="aurora-blob animate-aurora blob-purple" />
        <div className="aurora-blob animate-aurora blob-pink" />
        <div className="aurora-blob animate-float-slow blob-orange" />
      </div>

      {/* Floating notes (mobile only) */}
      <div className="music-notes-wrap landing-notes-mobile" aria-hidden="true">
        <span className="music-note note-1">♪</span>
        <span className="music-note note-2">♫</span>
        <span className="music-note note-3">♩</span>
        <span className="music-note note-4">♬</span>
        <span className="music-note note-5">♭</span>
      </div>

      {/* ── Top bar (desktop) ── */}
      <header className="landing-topbar">
        <ZikafonLogo variant="full" size={30} />
        <nav className="landing-topnav" aria-label="Navigation principale">
          <Link href="/login"    className="landing-topnav-link">Se connecter</Link>
          <Link href="/register" className="btn-aurora landing-topnav-cta">
            <span className="btn-aurora-inner">Commencer</span>
          </Link>
        </nav>
      </header>

      {/* ── Two-column layout (desktop) / single-column (mobile) ── */}
      <div className="landing-body">

        {/* LEFT — hero panel */}
        <section className="landing-hero-panel animate-slide-up">
          {/* Mobile: small vinyl + brand above form area */}
          <div className="landing-hero-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" aria-hidden="true" width={96} height={96} className="mascot-brand-lg" />
            <h1 className="landing-title">
              <span className="text-gradient">Zikafon</span>
            </h1>
            <p className="landing-tagline">Ta musique selon<br/>ton mood.</p>
            <p className="landing-desc">
              Décris comment tu te sens — l&apos;IA analyse ta vibe et te propose les tracks
              parfaites. Swipe, like, répète.
            </p>
          </div>

          {/* CTA (desktop: inline | mobile: below features) */}
          <div className="landing-cta-inline animate-slide-up delay-1">
            <Link href="/register" className="btn-aurora landing-cta-btn">
              <span className="btn-aurora-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                Commence ta vibe
              </span>
            </Link>
            <Link href="/login" className="landing-login-link">
              Déjà membre ? <span className="landing-login-accent">Se connecter</span>
            </Link>
          </div>

          {/* Powered-by badge */}
          <div className="landing-badge animate-slide-up delay-2">
            <span className="landing-badge-dot" />
            Propulsé par Gemini AI · Deezer · Firebase
          </div>
        </section>

        {/* RIGHT — feature showcase panel */}
        <section className="landing-feature-panel animate-slide-up delay-1" aria-label="Fonctionnalités">

          {/* Big mock card */}
          <div className="landing-mock-card glass-card">
            <div className="landing-mock-top">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" aria-hidden="true" width={64} height={64} className="mascot-brand-sm" />
              <div className="landing-mock-info">
                <p className="landing-mock-track">Lo-fi Hip Hop</p>
                <p className="landing-mock-artist">Découverte du jour</p>
                <div className="landing-mock-pills">
                  <span className="keyword-pill">détendu</span>
                  <span className="genre-pill">lo-fi</span>
                </div>
              </div>
            </div>
            <div className="landing-mock-swipe">
              <button type="button" className="action-btn action-skip landing-mock-btn" tabIndex={-1} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <button type="button" className="action-btn action-like landing-mock-btn" tabIndex={-1} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
            <p className="landing-mock-hint">Swipe à droite pour liker · à gauche pour passer</p>
          </div>

          {/* Three feature chips */}
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon landing-feature-icon-purple">✍️</div>
              <h3 className="landing-feature-title">Décris ton mood</h3>
              <p className="landing-feature-desc">En quelques mots, dis-nous comment tu te sens.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon landing-feature-icon-pink">✨</div>
              <h3 className="landing-feature-title">Vibe analysée</h3>
              <p className="landing-feature-desc">Gemini AI détecte ton énergie et tes genres.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon landing-feature-icon-orange">🎵</div>
              <h3 className="landing-feature-title">Swipe & like</h3>
              <p className="landing-feature-desc">Sauvegarde tes coups de cœur sur Deezer.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
