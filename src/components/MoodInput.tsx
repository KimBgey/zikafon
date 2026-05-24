'use client'
import { useState, useRef } from 'react'

interface MoodInputProps {
  onSubmit: (text: string) => void
  isLoading: boolean
  error: string | null
  disabled?: boolean
}

export function MoodInput({ onSubmit, isLoading, error, disabled = false }: MoodInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const MAX = 500
  const isBlocked = isLoading || disabled

  const handleSubmit = () => {
    if (!value.trim() || isBlocked) return
    onSubmit(value.trim())
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div className="mood-input-wrap">
      <label htmlFor="mood-text" className="mood-input-label">
        Comment tu te sens en ce moment ?
      </label>

      <div className="mood-textarea-wrap">
        <textarea
          ref={textareaRef}
          id="mood-text"
          className="mood-textarea"
          placeholder="Ex: je suis épuisé mais heureux, j'ai besoin de quelque chose qui me booste doucement…"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          maxLength={MAX}
          rows={4}
          aria-describedby={error ? 'mood-error' : undefined}
          disabled={isBlocked}
        />
        <span
          className={`mood-char-count ${value.length > MAX * 0.85 ? 'mood-char-warn' : ''}`}
          aria-live="polite"
        >
          {value.length}/{MAX}
        </span>
      </div>

      {error && (
        <p id="mood-error" className="mood-error" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </p>
      )}

      <button
        type="button"
        className="btn-aurora mt-3"
        onClick={handleSubmit}
        disabled={isBlocked || value.trim().length < 2}
        aria-busy={isLoading ? 'true' : 'false'}
      >
        <span className="btn-aurora-inner">
          {isLoading ? (
            <>
              <svg className="mood-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                  strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
              Analyse en cours…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
              Trouve ma zik ✨
            </>
          )}
        </span>
      </button>

      <p className="mood-hint">⌘ + Entrée pour envoyer</p>
    </div>
  )
}
