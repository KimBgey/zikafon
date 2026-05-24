'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ZikafonLogo } from './ZikafonLogo'

interface NavItem {
  href: string
  label: string
  icon: (active: boolean) => React.ReactElement
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/home',
    label: 'Trouve ta vibe',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'Mes sessions',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0}/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: '/liked',
    label: 'Mes aimés',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, signOut } = useAuth()

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'
  const initials    = displayName.slice(0, 2).toUpperCase()
  const avatar      = user?.photoURL ?? null

  async function handleSignOut() {
    await signOut()
    router.replace('/')
  }

  return (
    <aside className="sidebar" aria-label="Navigation principale">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/home" className="sidebar-logo-link" aria-label="Zikafon — Accueil">
          <ZikafonLogo variant="full" size={34} />
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Menu</p>
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link${active ? ' sidebar-link-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="sidebar-link-icon">{icon(active)}</span>
              <span className="sidebar-link-label">{label}</span>
              {active && <span className="sidebar-link-pill" aria-hidden="true" />}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider" aria-hidden="true" />

      {/* Settings link */}
      <nav className="sidebar-nav sidebar-nav-bottom">
        <Link
          href="/settings"
          className={`sidebar-link${pathname === '/settings' ? ' sidebar-link-active' : ''}`}
          aria-current={pathname === '/settings' ? 'page' : undefined}
        >
          <span className="sidebar-link-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </span>
          <span className="sidebar-link-label">Paramètres</span>
          {pathname === '/settings' && <span className="sidebar-link-pill" aria-hidden="true" />}
        </Link>
      </nav>

      {/* User profile at bottom */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {avatar
            ? <img src={avatar} alt={displayName} className="sidebar-avatar-img" />
            : <div className="sidebar-avatar-initials">{initials}</div>
          }
        </div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{displayName}</p>
          <button
            type="button"
            className="sidebar-signout-btn"
            onClick={handleSignOut}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  )
}
