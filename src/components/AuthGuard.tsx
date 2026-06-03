'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

// Routes accessible inside the app shell without an account
const PUBLIC_IN_APP = ['/home']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_IN_APP.some(r => pathname === r || pathname.startsWith(`${r}/`))

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [user, loading, router, pathname, isPublic])

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" aria-label="Chargement…" />
      </div>
    )
  }

  // Public-in-app routes: render for everyone (anon or auth)
  if (isPublic) return <>{children}</>

  // Private routes: render only for authenticated users
  if (!user) return null

  return <>{children}</>
}
