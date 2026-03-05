import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useCredit } from '../context/CreditContext'
import AuthModal from './AuthModal'

const NAV_LINKS = [
  { to: '/convert', label: 'Convert', icon: 'fa-solid fa-shuffle' },
  { to: '/img-to-pdf', label: 'Image→PDF', icon: 'fa-solid fa-file-pdf' },
  { to: '/shorten', label: 'Short Link', icon: 'fa-solid fa-link' },
  { to: '/metadata', label: 'Metadata', icon: 'fa-solid fa-shield-halved' },
  { to: '/compress', label: 'Compressor',  icon: 'fa-solid fa-compress-arrows-alt' },
  { to: '/qr',       label: 'QR Code',     icon: 'fa-solid fa-qrcode' },
  { to: '/palette',  label: 'Colors',      icon: 'fa-solid fa-palette' },
]

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const { user, signOut, profile } = useAuth()
  const { credits } = useCredit()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [showAuth, setShowAuth]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const profileRef = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={'fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass border-b'}
        style={{
          borderColor: 'var(--border)',
          paddingTop: scrolled ? '10px' : '14px',
          paddingBottom: scrolled ? '10px' : '14px',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          background: scrolled ? 'var(--bg-glass)' : 'var(--surface)',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img
              src="https://rzhnxywqmlbvldmqmmsi.supabase.co/storage/v1/object/public/Content/Untitled%20design.png"
              alt="Transformix"
              height="32"
              style={{ display: 'block', flexShrink: 0, objectFit: 'contain', maxHeight: 32 }}
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'text-[var(--primary)] bg-[rgba(var(--primary-rgb),0.08)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                  }`
                }
                style={{ textDecoration: 'none' }}
              >
                <i className={`${link.icon} text-xs`}></i>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Credits badge — shows real count from localStorage per user */}
            {credits !== null && (
              <div className="credit-badge hide-mobile" title={user ? 'Logged in — 100 credits/24h' : 'Guest — 25 credits/28h'}>
                <span className="dot" style={{ background: credits <= 5 ? 'var(--danger)' : credits <= 15 ? 'var(--accent)' : 'var(--primary)' }} />
                <span style={{ color: credits <= 5 ? 'var(--danger)' : 'inherit' }}>
                  {credits} {user ? '' : 'guest '}credits
                </span>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              aria-label="Toggle theme"
            >
              <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: '#0a0a0a',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {(profile?.display_name || user.email || '?')[0].toUpperCase()}
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--card-shadow-hover)',
                      }}
                    >
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                        <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                          {profile?.display_name || 'User'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {user.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all"
                          style={{ color: 'var(--text-2)', textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <i className="fa-solid fa-user text-xs w-4"></i> Profile Settings
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all"
                          style={{ color: 'var(--text-2)', textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <i className="fa-solid fa-clock-rotate-left text-xs w-4"></i> History
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left transition-all"
                          style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <i className="fa-solid fa-arrow-right-from-bracket text-xs w-4"></i> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary py-2 px-4 text-sm hide-mobile">
                Sign In
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              onClick={() => setMenuOpen(m => !m)}
            >
              <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} text-sm`}></i>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-3 px-2 flex flex-col gap-1 border-t mt-3" style={{ borderColor: 'var(--border)' }}>
                {NAV_LINKS.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'text-[var(--primary)] bg-[rgba(var(--primary-rgb),0.08)]'
                          : 'text-[var(--text-muted)]'
                      }`
                    }
                    style={{ textDecoration: 'none' }}
                  >
                    <i className={`${link.icon} text-sm w-5`}></i>
                    {link.label}
                  </NavLink>
                ))}
                {!user && (
                  <button
                    onClick={() => { setShowAuth(true); setMenuOpen(false) }}
                    className="btn-primary mt-2 w-full justify-center"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </AnimatePresence>
    </>
  )
}
