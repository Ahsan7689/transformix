import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useCredit } from '../context/CreditContext'
import { useAuth } from '../context/AuthContext'
import CreditGuard from '../components/CreditGuard'

// Generate a random 6-char slug
function generateSlug(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function isValidURL(str) {
  try { new URL(str); return true } catch { return false }
}

function LinkRow({ link, onDelete }) {
  const [copied, setCopied] = useState(false)
  const shortUrl = `${window.location.origin}/s/${link.short_code}`

  const copy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card p-4"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(248,212,155,0.15)', color: 'var(--accent)', border: '1px solid rgba(248,212,155,0.25)' }}
        >
          <i className="fa-solid fa-link text-sm"></i>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: 'var(--primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}>
            /s/{link.short_code}
          </p>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            {link.original_url}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-lg"
            style={{ background: 'var(--bg-2)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {link.clicks || 0} clicks
          </span>
          <button
            onClick={copy}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: copied ? 'rgba(34,197,94,0.15)' : 'var(--bg-2)',
              color: copied ? '#22c55e' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-xs`}></i>
          </button>
          <a
            href={link.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
          </a>
          {onDelete && (
            <button
              onClick={() => onDelete(link.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <i className="fa-solid fa-trash text-xs"></i>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function LinkShortenerContent() {
  const { useCredit: consumeCredit } = useCredit()
  const { user } = useAuth()
  const [url, setUrl]         = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [links, setLinks]     = useState([])
  const [loading, setLoading] = useState(false)
  const [latestLink, setLatestLink] = useState(null)

  useEffect(() => {
    if (user) loadLinks()
  }, [user])

  const loadLinks = async () => {
    const { data } = await supabase
      .from('short_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setLinks(data)
  }

  const shorten = async () => {
    if (!url.trim()) return toast.error('Enter a URL to shorten')
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    if (!isValidURL(fullUrl)) return toast.error('Enter a valid URL')

    const ok = await consumeCredit()
    if (!ok) return toast.error('No credits remaining')

    setLoading(true)
    try {
      const slug = customSlug.trim() || generateSlug()

      // Check slug availability
      if (customSlug.trim()) {
        const { data: existing } = await supabase
          .from('short_links')
          .select('id')
          .eq('short_code', slug)
          .maybeSingle()
        if (existing) {
          toast.error('That custom slug is already taken')
          setLoading(false)
          return
        }
      }

      const row = {
        original_url: fullUrl,
        short_code: slug,
        user_id: user?.id || null,
        clicks: 0,
      }

      const { data, error } = await supabase.from('short_links').insert(row).select().maybeSingle()
      if (error) throw error

      setLatestLink(data || row)
      if (user) loadLinks()
      setUrl('')
      setCustomSlug('')
      toast.success('Short link created! 🔗')
    } catch (e) {
      toast.error('Error creating link: ' + e.message)
    }
    setLoading(false)
  }

  const deleteLink = async (id) => {
    await supabase.from('short_links').delete().eq('id', id)
    setLinks(prev => prev.filter(l => l.id !== id))
    toast.success('Link deleted')
  }

  const copyLatest = async () => {
    if (!latestLink) return
    await navigator.clipboard.writeText(`${window.location.origin}/s/${latestLink.short_code}`)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pb-16">
      <div className="tool-header">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(248,212,155,0.12)', border: '1px solid rgba(248,212,155,0.25)', color: 'var(--accent)' }}>
            <i className="fa-solid fa-link"></i>
          </div>
        </div>
        <h1>Link Shortener</h1>
        <p>Create clean, trackable short links in under a second.</p>
      </div>

      {/* Input card */}
      <div className="card p-6 mb-6" style={{ borderRadius: 'var(--radius-xl)' }}>
        <div className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 8 }}>
              <i className="fa-solid fa-globe mr-1.5"></i>Long URL
            </label>
            <input
              className="input-field"
              type="url"
              placeholder="https://your-very-long-url.com/that/needs/shortening"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && shorten()}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 8 }}>
              <i className="fa-solid fa-pen mr-1.5"></i>Custom slug (optional)
            </label>
            <div className="flex items-center gap-0">
              <span
                className="flex items-center px-3 h-11 text-sm rounded-l-lg flex-shrink-0"
                style={{
                  background: 'var(--bg)',
                  border: '1.5px solid var(--border)',
                  borderRight: 'none',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                }}
              >
                {window.location.hostname}/s/
              </span>
              <input
                className="input-field"
                style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
                placeholder="my-link"
                value={customSlug}
                onChange={e => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
              />
            </div>
          </div>
          <button
            className="btn-primary w-full justify-center"
            onClick={shorten}
            disabled={loading}
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating...</>
              : <><i className="fa-solid fa-link"></i> Shorten Link (1 credit)</>
            }
          </button>
        </div>
      </div>

      {/* Latest result */}
      <AnimatePresence>
        {latestLink && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-5 rounded-2xl"
            style={{ background: 'rgba(var(--primary-rgb), 0.08)', border: '1.5px solid rgba(var(--primary-rgb), 0.2)' }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 8 }}>Your short link:</p>
            <div className="flex items-center gap-3">
              <code
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: 'var(--primary)',
                  wordBreak: 'break-all',
                }}
              >
                {window.location.origin}/s/{latestLink.short_code}
              </code>
              <button
                className="btn-primary flex-shrink-0"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={copyLatest}
              >
                <i className="fa-solid fa-copy"></i> Copy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User's links history */}
      {user && links.length > 0 && (
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontSize: '0.95rem' }}>
            Your links ({links.length})
          </p>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {links.map(link => (
                <LinkRow key={link.id} link={link} onDelete={deleteLink} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!user && (
        <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-circle-info mr-1.5"></i>
          Sign in to save and manage your links
        </p>
      )}
    </div>
  )
}

export default function LinkShortener() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <CreditGuard>
        <LinkShortenerContent />
      </CreditGuard>
    </div>
  )
}
