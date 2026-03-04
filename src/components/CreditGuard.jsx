import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useCredit } from '../context/CreditContext'
import AuthModal from './AuthModal'

export default function CreditGuard({ children }) {
  const { credits, loading, user, nextReset } = useCredit()
  const [showAuth, setShowAuth] = useState(false)

  // Format time until reset
  const timeUntilReset = () => {
    if (!nextReset) return ''
    const diff = nextReset - new Date()
    if (diff <= 0) return 'soon'
    const h = Math.floor(diff / 3_600_000)
    const m = Math.floor((diff % 3_600_000) / 60_000)
    if (h > 0) return h + 'h ' + m + 'm'
    return m + 'm'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fa-solid fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i>
      </div>
    )
  }

  if (credits !== null && credits <= 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 text-3xl"
            style={{ background: 'rgba(248,155,155,0.12)', border: '1px solid rgba(248,155,155,0.25)', color: 'var(--danger)' }}>
            <i className="fa-solid fa-coins"></i>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text)', marginBottom: 8 }}>
            Out of credits
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 420, lineHeight: 1.7, marginBottom: 8 }}>
            {user
              ? 'You have used all your credits. Your 100 credits will refill in ' + timeUntilReset() + '.'
              : 'You have used all your guest credits. Sign in to get 100 credits, or wait for your free credits to reset in ' + timeUntilReset() + '.'}
          </p>

          {!user && (
            <div className="flex gap-3 mt-4">
              <button className="btn-primary" onClick={() => setShowAuth(true)}>
                <i className="fa-solid fa-user-plus"></i>
                Sign In for 100 Credits
              </button>
            </div>
          )}

          <div className="mt-5 px-5 py-3 rounded-xl flex items-center gap-2"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <i className="fa-solid fa-clock" style={{ color: 'var(--accent)', fontSize: '0.85rem' }}></i>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {user ? 'Refills in ' + timeUntilReset() + ' · 100 credits/day' : 'Guest resets in ' + timeUntilReset() + ' · Sign in for 100 credits/day'}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </AnimatePresence>
      </>
    )
  }

  return (
    <>
      {children}
      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </AnimatePresence>
    </>
  )
}
