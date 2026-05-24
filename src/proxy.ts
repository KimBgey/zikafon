import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const PRIVATE_ROUTES = ['/home', '/results', '/history', '/liked', '/settings']

// Routes only accessible when NOT authenticated
const AUTH_ROUTES = ['/login', '/register']

// In Next.js 16 the function must be named "proxy" (middleware is deprecated)
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get('zikafon_session')?.value

  const isPrivate = PRIVATE_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  )
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  )

  // Unauthenticated → private route: redirect to /login with return path
  if (isPrivate && !session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Already authenticated → auth route: redirect to /home
  if (isAuthRoute && session) {
    const url = req.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - API routes    (handled server-side; no auth redirect needed)
     * - Public asset extensions
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)',
  ],
}
