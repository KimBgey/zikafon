import { AuthGuard } from '@/components/AuthGuard'
import { BottomNav } from '@/components/BottomNav'
import { Sidebar } from '@/components/Sidebar'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {/* Desktop: sidebar + main content side-by-side.
          Mobile:  full-width content + fixed bottom nav. */}
      <div className="app-layout">
        {/* Hidden on mobile (<lg), visible on desktop */}
        <Sidebar />

        {/* Main scrollable area */}
        <div className="app-main">
          {children}
        </div>

        {/* Visible on mobile, hidden on desktop (CSS-driven) */}
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
