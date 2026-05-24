'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ZikafonLogo } from '@/components/ZikafonLogo'

/* ── Left branding panel (shared with login) ── */
function AuthBranding() {
  return (
    <div className="auth-branding">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-blob animate-aurora blob-purple" />
        <div className="aurora-blob animate-aurora blob-pink" />
        <div className="aurora-blob animate-float-slow blob-orange" />
      </div>
      <div className="auth-branding-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" aria-hidden="true" width={80} height={80} className="mascot-brand-auth" />
        <h2 className="auth-branding-title">
          <span className="text-gradient">Rejoins la vibe.</span>
        </h2>
        <p className="auth-branding-desc">
          Crée ton compte gratuitement et commence à découvrir ta musique selon ton mood.
        </p>
        <div className="auth-branding-steps">
          {[
            { icon: '✍️', text: 'Décris ton humeur' },
            { icon: '✨', text: 'IA analyse ta vibe' },
            { icon: '🎵', text: 'Swipe les tracks' },
          ].map(({ icon, text }) => (
            <div key={text} className="auth-branding-step">
              <span className="auth-branding-step-icon">{icon}</span>
              <span className="auth-branding-step-text">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [error, setError]             = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)
    if (!displayName.trim()) { setError('Ton prénom ou pseudo est requis.'); return }
    if (password.length < 6)  { setError('Le mot de passe doit faire au moins 6 caractères.'); return }
    if (password !== confirm)  { setError('Les mots de passe ne correspondent pas.'); return }

    setLoading(true)
    try {
      await signUp(email, password, displayName.trim())
      router.replace('/home')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('email-already-in-use')) setError('Cet email est déjà utilisé. Connecte-toi ou essaie un autre.')
      else if (msg.includes('weak-password'))    setError('Mot de passe trop faible.')
      else if (msg.includes('invalid-email'))    setError('Email invalide.')
      else setError('Une erreur est survenue. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      router.replace('/home')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (!msg.includes('popup-closed')) setError('Connexion Google annulée ou impossible.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-split-layout">
      {/* Left: branding (desktop only) */}
      <AuthBranding />

      {/* Right: form */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          {/* Mobile logo */}
          <div className="auth-logo auth-logo-mobile">
            <ZikafonLogo variant="full" size={36} />
          </div>

          <h1 className="auth-title">Rejoins la vibe 🎶</h1>
          <p className="auth-subtitle">Crée ton compte gratuitement.</p>

          {error && (
            <div className="auth-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"/>
              </svg>
              {error}
            </div>
          )}

          {/* Google first */}
          <button type="button" className="google-btn" onClick={handleGoogle} disabled={loading || googleLoading}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Connexion…' : 'Continuer avec Google'}
          </button>

          <div className="auth-divider"><span>ou</span></div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="displayName">Pseudo / Prénom</label>
              <input id="displayName" type="text" className="auth-input" placeholder="Comment tu t'appelles ?"
                value={displayName} onChange={e => setDisplayName(e.target.value)} required autoFocus autoComplete="name"/>
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email</label>
              <input id="email" type="email" className="auth-input" placeholder="toi@exemple.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/>
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Mot de passe</label>
              <input id="password" type="password" className="auth-input" placeholder="6 caractères minimum"
                value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password"/>
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="confirm">Confirmer</label>
              <input id="confirm" type="password" className="auth-input" placeholder="Répète ton mot de passe"
                value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password"/>
            </div>
            <button type="submit" className="btn-aurora w-full" disabled={loading || googleLoading}>
              <span className="btn-aurora-inner">
                {loading
                  ? <><svg className="mood-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Création…</>
                  : 'Créer mon compte'}
              </span>
            </button>
          </form>

          <p className="auth-footer">
            Déjà un compte ?{' '}
            <Link href="/login" className="auth-link">Se connecter</Link>
          </p>
          <Link href="/" className="auth-back">← Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  )
}
