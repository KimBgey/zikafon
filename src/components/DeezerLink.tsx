'use client'

interface DeezerLinkProps {
  url: string
  trackName: string
  /** 'pill' = icon + text (default) | 'icon' = icon only (tight spaces) */
  variant?: 'pill' | 'icon'
}

const DeezerIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M18.81 11.647h3.19V9.993h-3.19zm0 3.33h3.19v-1.655h-3.19zm0-6.664h3.19V6.659h-3.19zm0 9.997h3.19v-1.654h-3.19zM0 18.31h3.19v-1.654H0zm6.27 0h3.19v-1.654H6.27zm6.27 0h3.19v-1.654h-3.19zM6.27 14.977h3.19v-1.654H6.27zm6.27 0h3.19v-1.654h-3.19zm0-3.33h3.19V9.993h-3.19zM6.27 11.647h3.19V9.993H6.27zm0-3.33h3.19V6.659H6.27z"/>
  </svg>
)

export function DeezerLink({ url, trackName, variant = 'pill' }: DeezerLinkProps) {
  if (!url) return null

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="deezer-icon-btn"
        aria-label={`Écouter "${trackName}" en entier sur Deezer`}
        title="Écouter sur Deezer"
        onClick={e => e.stopPropagation()}
      >
        <DeezerIcon size={15} />
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="deezer-pill"
      aria-label={`Écouter "${trackName}" en entier sur Deezer`}
      onClick={e => e.stopPropagation()}
    >
      <DeezerIcon size={13} />
      <span>Écouter sur Deezer</span>
      {/* External link arrow */}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </a>
  )
}
