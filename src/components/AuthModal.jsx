import { useState } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function AuthModal({ onClose }) {
  const { signIn, signUp, signInGoogle } = useAuth()
  const [mode, setMode]       = useState('signin') // 'signin' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) return toast.error('Fill in all fields')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        toast.success('Welcome back! 🎉')
        onClose()
      } else {
        const { error } = await signUp(email, password, name)
        if (error) throw error
        toast.success('Account created! Check your email.')
        onClose()
      }
    } catch (e) {
      toast.error(e.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await signInGoogle()
    onClose()
  }

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="modal-card"
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text)' }}>
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
              {mode === 'signin' ? 'Sign in to unlock 100 free credits' : 'Get 100 credits on signup, free'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-4 font-medium text-sm transition-all"
          style={{
            background: 'var(--bg-2)',
            border: '1.5px solid var(--border)',
            color: 'var(--text)',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <i className="fa-brands fa-google text-base"></i>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 6 }}>Display Name</label>
              <input
                className="input-field"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 6 }}>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 6 }}>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        <button
          className="btn-primary w-full justify-center mt-5"
          onClick={handleSubmit}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading
            ? <><i className="fa-solid fa-spinner fa-spin"></i> Loading...</>
            : mode === 'signin' ? 'Sign In' : 'Create Account'
          }
        </button>

        <p className="text-center mt-4" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </motion.div>
  )
}
