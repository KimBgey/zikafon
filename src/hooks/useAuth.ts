'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  createElement,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createUserDoc } from '@/lib/firestore'

// ── Cookie helpers ────────────────────────────────────────────────────────────

function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string, displayName: string) => Promise<User>
  signInWithGoogle: () => Promise<User>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u) {
        setCookie('zikafon_session', u.uid)
      } else {
        deleteCookie('zikafon_session')
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName })
      await createUserDoc(cred.user.uid, {
        displayName,
        email: cred.user.email ?? email,
      })
      return cred.user
    },
    []
  )

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    await createUserDoc(cred.user.uid, {
      displayName: cred.user.displayName ?? 'Utilisateur',
      email: cred.user.email ?? '',
      photoURL: cred.user.photoURL ?? undefined,
    })
    return cred.user
  }, [])

  const signOut = useCallback(async () => {
    await fbSignOut(auth)
    deleteCookie('zikafon_session')
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return createElement(AuthContext.Provider, { value }, children)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
