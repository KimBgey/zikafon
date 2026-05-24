'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { deleteUserAccount } from '@/lib/firestore'
import { deleteUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'
  const email       = user?.email ?? ''
  const avatar      = user?.photoURL ?? null
  const initials    = displayName.slice(0, 2).toUpperCase()

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      router.replace('/')
    } catch (err) {
      console.error(err)
    } finally {
      setSigningOut(false)
    }
  }

  async function handleDeleteAccount() {
    if (!user) return
    setDeleting(true)
    setError(null)
    try {
      // Delete Firestore doc first
      await deleteUserAccount(user.uid)
      // Then delete the Firebase Auth user
      const currentUser = auth.currentUser
      if (currentUser) await deleteUser(currentUser)
      router.replace('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('requires-recent-login')) {
        setError('Pour supprimer ton compte, reconnecte-toi d\'abord.')
      } else {
        setError('Impossible de supprimer le compte. Réessaie.')
      }
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="settings-shell">
      {/* Aurora */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="aurora-blob animate-aurora blob-purple" style={{ opacity: 0.25 }} />
        <div className="aurora-blob animate-aurora blob-orange" style={{ opacity: 0.15, animationDelay: '3s' }} />
      </div>

      <div className="settings-content">

        {/* Header */}
        <header className="settings-header">
          <h1 className="settings-title">Mon profil</h1>
        </header>

        {/* Avatar + identity */}
        <section className="settings-avatar-section glass-card animate-scale-in">
          <div className="settings-avatar">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={displayName} className="settings-avatar-img" />
            ) : (
              <div className="settings-avatar-initials">{initials}</div>
            )}
            <div className="settings-avatar-ring" aria-hidden="true" />
          </div>
          <div className="settings-identity">
            <p className="settings-name">{displayName}</p>
            <p className="settings-email">{email}</p>
          </div>
        </section>

        {/* Account section */}
        <section className="settings-section glass-card animate-slide-up delay-1">
          <p className="settings-section-title">Compte</p>

          <button
            type="button"
            className="settings-row settings-row-signout"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-busy={signingOut ? 'true' : 'false'}
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
            className="settings-row settings-row-delete"
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

        {/* Error */}
        {error && (
          <div className="auth-error animate-scale-in" role="alert">{error}</div>
        )}

        {/* App info */}
        <footer className="settings-footer animate-slide-up delay-2">
          <p className="settings-app-name">
            <span className="text-gradient">Zikafon</span>
          </p>
          <p className="settings-app-version">Propulsé par Gemini AI · Deezer · Firebase</p>
        </footer>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="Confirmer la suppression">
          <div className="settings-confirm-card glass-card animate-scale-in">
            <div className="settings-confirm-icon">⚠️</div>
            <h2 className="settings-confirm-title">Supprimer mon compte ?</h2>
            <p className="settings-confirm-desc">
              Cette action est irréversible. Toutes tes sessions et tes tracks aimées seront perdues.
            </p>
            <div className="settings-confirm-actions">
              <button
                type="button"
                className="settings-confirm-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                type="button"
                className="settings-confirm-delete"
                onClick={handleDeleteAccount}
                disabled={deleting}
                aria-busy={deleting ? 'true' : 'false'}
              >
                {deleting ? 'Suppression…' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
