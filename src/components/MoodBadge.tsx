'use client'
import { MoodAnalysis } from '@/types'

interface MoodBadgeProps {
  mood: MoodAnalysis
}

const TEMPO_LABELS: Record<string, string> = {
  slow: 'Doux',
  medium: 'Équilibré',
  fast: 'Rapide',
}

export function MoodBadge({ mood }: MoodBadgeProps) {
  const energyPct = Math.round(mood.energy * 100)
  const valencePct = Math.round(mood.valence * 100)

  return (
    <div className="mood-badge-wrap">
      {/* Keywords */}
      <div className="mood-badge-keywords">
        {mood.keywords.slice(0, 4).map(kw => (
          <span key={kw} className="keyword-pill">{kw}</span>
        ))}
        {mood.genres.slice(0, 2).map(g => (
          <span key={g} className="genre-pill">{g}</span>
        ))}
      </div>

      {/* Energy / Valence bars */}
      <div className="mood-badge-bars">
        <MoodBar label="Énergie" value={energyPct} color="#7C3AED" />
        <MoodBar label="Humeur" value={valencePct} color="#EC4899" />
      </div>

      <span className="tempo-badge">
        {TEMPO_LABELS[mood.tempo] ?? mood.tempo}
      </span>
    </div>
  )
}

function MoodBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mood-bar-row">
      <span className="mood-bar-label">{label}</span>
      <div className="mood-bar-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="mood-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="mood-bar-pct">{value}%</span>
    </div>
  )
}
