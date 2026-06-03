'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { deleteUserAccount, getPlanInfo, type PlanInfo } from '@/lib/firestore'
import { deleteUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { PLANS } from '@/lib/stripe'

function SettingsContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const [signingOut, setSigningOut]       = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [planInfo, setPlanInfo]           = useState<PlanInfo | null>(null)
  const [upgraded, setUpgraded]           = useState(false)

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'
  const email       = user?.email ?? ''
  const avatar      = user?.photoURL ?? null
  const initials    = displayName.slice(0, 2).toUpperCase()

  useEffect(() => {
    if (!user) return
    getPlanInfo(user.uid).then(setPlanInfo).catch(console.error)
  }, [user])

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setUpgraded(true)
      setTimeout(() => {
        if (user) getPlanInfo(user.uid).then(setPlanInfo).catch(console.error)
      }, 2500)
    }
  }, [searchParams, user])

  async function handleSignOut() {
    setSigningOut(true)
    try { await signOut(); router.replace('/') }
    catch (err) { console.error(err) }
    finally { setSigningOut(false) }
  }

  async function handleDeleteAccount() {
    if (!user) return
    setDeleting(true)
    setError(null)
    try {
      await deleteUserAccount(user.uid)
      const currentUser = auth.currentUser
      if (currentUser) await deleteUser(currentUser)
      router.replace('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg.includes('requires-recent-login')
        ? 'Pour supprimer ton compte, reconnecte-toi d\'abord.'
        : 'Impossible de supprimer le compte. Réessaie.')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  async function handleManageSubscription() {
    if (!user) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      })
      const { url, error: err } = await res.json()
      if (err) throw new Error(err)
      window.location.href = url
    } catch (e) { console.error(e); setPortalLoading(false) }
  }

  const plan     = planInfo?.plan ?? 'free'
  const planMeta = PLANS[plan]
  const isFree   = plan === 'free'
  const today    = new Date().toISOString().split('T')[0]
  const usedToday = planInfo?.dailySearches?.date === today
    ? planInfo.dailySearches.count : 0

  return (
    <main className="settings-shell">
      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="aurora-blob animate-aurora blob-purple settings-aurora-purple" />
        <div className="aurora-blob animate-aurora blob-orange settings-aurora-orange" />
      </div>

      <div className="settings-content">

        {/* Upgraded banner */}
        {upgraded && (
          <div className="settings-upgraded-banner animate-scale-in" role="status">
            🎉 Bienvenue dans Vibe {plan === 'max' ? 'Max' : 'Pro'} ! Tes recherches sont maintenant illimitées.
          </div>
        )}

        <header className="settings-header">
          <h1 className="settings-title">Mon profil</h1>
        </header>

        {/* Avatar + identity */}
        <section className="settings-avatar-section glass-card animate-scale-in">
          <div className="settings-avatar">
            {avatar
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatar} alt={displayName} className="settings-avatar-img" />
              : <div className="settings-avatar-initials">{initials}</div>
            }
            <div className="settings-avatar-ring" aria-hidden="true" />
          </div>
          <div className="settings-identity">
            <p className="settings-name">{displayName}</p>
            <p className="settings-email">{email}</p>
          </div>
        </section>

        {/* ── Plan section ── */}
        <section className="settings-section glass-card animate-slide-up delay-1">
          <p className="settings-section-title">Abonnement</p>

          <div className="settings-plan-row">
            <div className="settings-plan-info">
              <span className={`settings-plan-badge settings-plan-badge-${plan}`}>
                {planMeta.label}
              </span>
              <span className="settings-plan-price">{planMeta.price}</span>
            </div>

            {isFree && (
              <div className="settings-plan-usage">
                <p className="settings-plan-usage-label">
                  Recherches aujourd&apos;hui
                </p>
                <div className="settings-plan-bar">
                  <div
                    className="settings-plan-bar-fill"
                    style={{ '--w': `${Math.min((usedToday / 3) * 100, 100)}%` } as React.CSSProperties}
                  />
                </div>
                <p className="settings-plan-usage-count">
                  {usedToday} / 3 utilisées
                </p>
              </div>
            )}

            {isFree ? (
              <Link href="/pricing" className="btn-aurora settings-upgrade-btn">
                <span className="btn-aurora-inner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Passer à Pro
                </span>
              </Link>
            ) : (
              <button
                type="button"
                className="settings-portal-btn"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? 'Chargement…' : 'Gérer mon abonnement →'}
              </button>
            )}
          </div>
        </section>

        {/* Account section */}
        <section className="settings-section glass-card animate-slide-up delay-2">
          <p className="settings-section-title">Compte</p>

          <button
            type="button"
            className="settings-row"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-busy={signingOut}
          >
            <div className="settings-row-icon settings-row-icon-red">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <span className="settings-row-label">
              {signingOut ? 'Déconnexion…' : 'Se déconnecter'}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="settings-row-arrow" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <button
            type="button"
            className="settings-row"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
          >
            <div className="settings-row-icon settings-row-icon-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <span className="settings-row-label settings-row-label-danger">
              Supprimer mon compte
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="settings-row-arrow" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </section>

        {error && (
          <div className="auth-error animate-scale-in" role="alert">{error}</div>
        )}

        <footer className="settings-footer animate-slide-up delay-3">
          <p className="settings-app-name"><span className="text-gradient">Zikafon</span></p>
          <p className="settings-app-version">Propulsé par Gemini AI · Deezer · Firebase · Stripe</p>
        </footer>
      </div>

      {/* Delete overlay */}
      {showDeleteConfirm && (
        <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="Confirmer la suppression">
          <div className="settings-confirm-card glass-card animate-scale-in">
            <div className="settings-confirm-icon">⚠️</div>
            <h2 className="settings-confirm-title">Supprimer mon compte ?</h2>
            <p className="settings-confirm-desc">
              Cette action est irréversible. Toutes tes sessions et tes tracks aimées seront perdues.
            </p>
            <div className="settings-confirm-actions">
              <button type="button" className="settings-confirm-cancel"
                onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Annuler
              </button>
              <button type="button" className="settings-confirm-delete"
                onClick={handleDeleteAccount} disabled={deleting} aria-busy={deleting}>
                {deleting ? 'Suppression…' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="auth-loading-screen"><div className="auth-spinner" /></div>}>
      <SettingsContent />
    </Suspense>
  )
}
