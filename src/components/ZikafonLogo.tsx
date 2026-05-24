interface ZikafonLogoProps {
  /** 'full' = mascot + wordmark (default) | 'icon' = mascot only | 'wordmark' = text only */
  variant?: 'full' | 'icon' | 'wordmark'
  /** Size in px of the mascot icon — ignored for 'wordmark' variant */
  size?: number
  className?: string
}

/** The Zikafon mascot PNG — served from /public/icon.png */
const Mascot = ({ size = 32, className = '' }: { size?: number; className?: string }) => (
  /* eslint-disable @next/next/no-img-element */
  <img
    src="/icon.png"
    alt="Zikafon mascot"
    width={size}
    height={size}
    className={`logo-mascot ${className}`}
  />
)

export function ZikafonLogo({ variant = 'full', size = 32, className }: ZikafonLogoProps) {
  if (variant === 'icon') {
    return <Mascot size={size} className={className} />
  }

  if (variant === 'wordmark') {
    return (
      <span className={`logo-wordmark${className ? ` ${className}` : ''}`}>
        <span className="text-gradient">Zikafon</span>
      </span>
    )
  }

  // full: mascot + wordmark
  return (
    <div className={`logo-full${className ? ` ${className}` : ''}`}>
      <Mascot size={size} />
      <span className="logo-full-text">
        <span className="text-gradient">Zikafon</span>
      </span>
    </div>
  )
}
