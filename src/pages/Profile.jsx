import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useCredit } from '../context/CreditContext'

export default function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { credits, nextReset } = useCredit()
  const navigate = useNavigate()
  const [name, setName]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    setName(profile?.display_name || '')
  }, [user, profile])

  const save = async () => {
    setLoading(true)
    const { error } = await updateProfile({ display_name: name })
    if (error) toast.error('Failed to update profile')
    else toast.success('Profile updated!')
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const formatTimeUntil = (date) => {
    if (!date) return '—'
    const ms = date - new Date()
    if (ms < 0) return 'Now'
    const h = Math.floor(ms / 3600_000)
    const m = Math.floor((ms % 3600_000) / 60_000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  if (!user) return null

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="max-w-2xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-5 mb-8">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: '#0a0a0a',
                fontFamily: 'var(--font-display)',
              }}
            >
              {(profile?.display_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--text)' }}>
                {profile?.display_name || 'Your Profile'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>{user.email}</p>
            </div>
          </div>

          {/* Credits card */}
          <div
            className="rounded-3xl p-6 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.12), rgba(var(--accent-rgb),0.08))',
              border: '1.5px solid rgba(var(--primary-rgb), 0.2)',
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 4 }}>Available Credits</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '3rem', color: 'var(--primary)', lineHeight: 1 }}>
                  {credits ?? '—'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>
                  Resets in: <strong style={{ color: 'var(--text)' }}>{formatTimeUntil(nextReset)}</strong>
                </p>
              </div>
              <div className="text-right">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>Signed In Plan</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="pill">
                    <i className="fa-solid fa-circle-check text-xs" style={{ color: 'var(--success)' }}></i>
                    100 credits / reset
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 8 }}>+50 every 24 hours</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="card p-6 mb-5" style={{ borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: 20 }}>
              <i className="fa-solid fa-user-gear mr-2"></i>Profile Settings
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 8 }}>
                  Display Name
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 8 }}>
                  Email
                </label>
                <input
                  className="input-field"
                  type="email"
                  value={user.email}
                  readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <button
                className="btn-primary"
                onClick={save}
                disabled={loading}
                style={{ alignSelf: 'flex-start' }}
              >
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                  : <><i className="fa-solid fa-floppy-disk"></i> Save Changes</>
                }
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="card p-6 mb-5" style={{ borderRadius: 'var(--radius-xl)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: 20 }}>
              <i className="fa-solid fa-chart-simple mr-2"></i>Usage Stats
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Operations', value: profile?.total_ops ?? 0, icon: 'fa-solid fa-bolt' },
                { label: 'Member Since', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '—', icon: 'fa-solid fa-calendar' },
                { label: 'Account Type', value: 'Signed In', icon: 'fa-solid fa-circle-check' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-2)' }}>
                  <i className={`${stat.icon} text-lg mb-2`} style={{ color: 'var(--primary)', display: 'block' }}></i>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                    {stat.value}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div
            className="p-6 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--danger)', marginBottom: 12 }}>
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>Account Actions
            </h2>
            <button
              className="btn-outline"
              onClick={handleSignOut}
              style={{ borderColor: 'rgba(239,68,68,0.4)', color: 'var(--danger)' }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
