import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import { useCredit } from '../context/CreditContext'
import CreditGuard from '../components/CreditGuard'

// In dev: use Vite proxy (/api/image → image.pollinations.ai) to bypass COEP
// In prod: use direct URL (deploy to a host without COEP headers, e.g. Vercel/Netlify)
const isDev = import.meta.env.DEV
const BASE_URL = isDev ? '/api/image/prompt/' : 'https://image.pollinations.ai/prompt/'

function buildImageUrl(prompt) {
  const seed = Math.floor(Math.random() * 999999)
  return (
    BASE_URL +
    encodeURIComponent(prompt) +
    '?width=1024&height=1024&seed=' + seed +
    '&model=flux&enhance=true'
  )
}

const STYLES = [
  { label: 'Photorealistic', icon: 'fa-solid fa-camera',     suffix: 'photorealistic, ultra detailed, 8k resolution, cinematic lighting' },
  { label: 'Digital Art',   icon: 'fa-solid fa-palette',    suffix: 'digital art, vibrant colors, artstation trending, concept art' },
  { label: 'Anime',         icon: 'fa-solid fa-star',       suffix: 'anime illustration, colorful, studio ghibli inspired, detailed' },
  { label: 'Oil Painting',  icon: 'fa-solid fa-brush',      suffix: 'oil painting, classical style, museum quality, rich textures' },
  { label: 'Watercolor',    icon: 'fa-solid fa-droplet',    suffix: 'watercolor painting, soft edges, pastel tones' },
  { label: 'Minimalist',    icon: 'fa-solid fa-minus',      suffix: 'minimalist design, clean geometric shapes, modern aesthetic' },
  { label: '3D Render',     icon: 'fa-solid fa-cube',       suffix: '3D CGI render, octane render, PBR materials, ray-traced' },
  { label: 'Cinematic',     icon: 'fa-solid fa-film',       suffix: 'cinematic still, dramatic lighting, anamorphic lens, film grain' },
  { label: 'Abstract',      icon: 'fa-solid fa-shapes',     suffix: 'abstract expressionism, bold colors, dynamic composition' },
  { label: 'Pixel Art',     icon: 'fa-solid fa-border-all', suffix: 'pixel art, retro 16-bit style, detailed sprites' },
]

const EXAMPLES = [
  'A futuristic city skyline at sunset with flying cars and holographic billboards',
  'A cozy mountain cabin in heavy snowfall, warm amber light glowing from windows',
  'An astronaut surfing a giant ocean wave in outer space, nebula background',
  'A dragon made of crystal and stained glass glowing in golden light',
  'A magical ancient library with floating books, candles, and fireflies',
  'Portrait of a cyberpunk street vendor in a neon-lit rainy alley',
  'A giant whale swimming through clouds above mountains at golden hour',
  'A tiny cozy village inside a snow globe, cinematic macro photography',
]

const MSGS = [
  'Crafting your image with AI...',
  'Painting pixels from your imagination...',
  'Rendering your vision into reality...',
  'Adding final details and lighting...',
  'Almost there, finalizing...',
]

function ImageCard({ url, prompt }) {
  const [status, setStatus] = useState('loading')

  const dl = () => window.open(url, '_blank')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      className="rounded-2xl overflow-hidden group relative"
      style={{ border: '1px solid var(--border)', minHeight: 260, background: 'var(--surface-2)' }}
    >
      <img
        src={url}
        alt={prompt}
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('error')}
        style={{
          display: status === 'error' ? 'none' : 'block',
          width: '100%',
          objectFit: 'cover',
        }}
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(248,155,155,0.12)', border: '1px solid rgba(248,155,155,0.3)' }}>
            <i className="fa-solid fa-spinner fa-spin text-xl" style={{ color: '#F89B9B' }}></i>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Generating image...</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', opacity: 0.6 }}>Usually 5–15 seconds</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-triangle-exclamation text-2xl" style={{ color: 'var(--danger)' }}></i>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Could not load image</p>
          <button
            onClick={() => setStatus('loading')}
            className="btn-outline"
            style={{ fontSize: '0.78rem', padding: '6px 14px' }}
          >
            <i className="fa-solid fa-rotate-right"></i> Retry
          </button>
        </div>
      )}

      {status === 'ready' && (
        <div
          className="absolute inset-0 flex flex-col items-end justify-end opacity-0 group-hover:opacity-100 transition-all"
          style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.88))', padding: '1.25rem' }}
        >
          <p className="text-white text-xs mb-3 w-full" style={{ lineHeight: 1.55, opacity: 0.85 }}>
            {prompt.length > 100 ? prompt.slice(0, 100) + '...' : prompt}
          </p>
          <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '7px 16px' }} onClick={dl}>
            <i className="fa-solid fa-arrow-up-right-from-square"></i> Open / Save
          </button>
        </div>
      )}
    </motion.div>
  )
}

function Content() {
  const { useCredit: consume } = useCredit()
  const [prompt,  setPrompt]  = useState('')
  const [style,   setStyle]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [images,  setImages]  = useState([])
  const [msg,     setMsg]     = useState('')
  const [prog,    setProg]    = useState(0)
  const tRef = useRef(null)
  const pRef = useRef(null)

  const startLoaders = () => {
    let i = 0
    setMsg(MSGS[0])
    tRef.current = setInterval(() => { i = (i + 1) % MSGS.length; setMsg(MSGS[i]) }, 2200)
    let p = 0
    pRef.current = setInterval(() => { p = Math.min(p + Math.random() * 8, 88); setProg(Math.round(p)) }, 400)
  }

  const stopLoaders = () => {
    clearInterval(tRef.current)
    clearInterval(pRef.current)
  }

  const generate = async () => {
    if (!prompt.trim()) return toast.error('Please describe the image you want')
    const ok = await consume()
    if (!ok) return toast.error('No credits remaining')
    setLoading(true)
    setProg(0)
    startLoaders()
    const fp = style ? prompt.trim() + ', ' + style.suffix : prompt.trim()
    try {
      const url = buildImageUrl(fp)
      setProg(100)
      setImages(prev => [{ url, prompt: fp }, ...prev].slice(0, 12))
      toast.success('Generating — image loads in the card below!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      stopLoaders()
      setLoading(false)
      setTimeout(() => setProg(0), 1500)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16">

      <div className="tool-header">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(248,155,155,0.12)', border: '1px solid rgba(248,155,155,0.25)', color: '#F89B9B' }}>
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
        </div>
        <h1>AI Image Generator</h1>
        <p>Describe anything and AI creates it instantly. <strong>100% free</strong>, unlimited, no API key needed.</p>
      </div>

      <div className="flex justify-center mb-6">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 12,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          color: '#22c55e', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
        }}>
          <i className="fa-solid fa-circle-check text-xs"></i>
          Pollinations AI (Flux) · FREE · Unlimited · No quota ever
        </div>
      </div>

      <div className="mb-6">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 10 }}>
          Style preset <span style={{ opacity: 0.5 }}>(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLES.map(s => (
            <button key={s.label} onClick={() => setStyle(style && style.label === s.label ? null : s)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px',
              borderRadius: 10, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-display)', transition: 'all 0.2s',
              background: style && style.label === s.label ? 'var(--primary)' : 'var(--surface)',
              color: style && style.label === s.label ? '#0a0a0a' : 'var(--text-muted)',
              border: '1px solid ' + (style && style.label === s.label ? 'var(--primary)' : 'var(--border)'),
            }}>
              <i className={s.icon + ' text-xs'}></i> {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 mb-6" style={{ borderRadius: 'var(--radius-xl)' }}>
        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 10 }}>
          <i className="fa-solid fa-pen-to-square mr-1"></i> Describe your image
        </label>
        <textarea className="input-field" style={{ minHeight: 110, resize: 'vertical' }}
          placeholder="A majestic white tiger in a cyberpunk city at midnight, rain reflections, ultra-detailed..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) generate() }}
        />
        <div className="mt-3 mb-4">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>
            <i className="fa-solid fa-lightbulb mr-1" style={{ color: 'var(--accent)' }}></i> Need inspiration?
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(p => (
              <button key={p} onClick={() => setPrompt(p)} style={{
                fontSize: '0.73rem', padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'var(--bg-2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                fontFamily: 'var(--font-body)', maxWidth: 240, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <kbd style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Ctrl+Enter</kbd> to generate
          </p>
          <button className="btn-primary" onClick={generate} disabled={loading || !prompt.trim()}
            style={{ padding: '10px 24px', opacity: loading || !prompt.trim() ? 0.65 : 1 }}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Generating...</>
              : <><i className="fa-solid fa-sparkles"></i> Generate Image (1 credit)</>
            }
          </button>
        </div>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center py-10 mb-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-5"
              style={{ background: 'rgba(248,155,155,0.12)', border: '2px solid rgba(248,155,155,0.3)',
                color: '#F89B9B', animation: 'spin-slow 4s linear infinite' }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <motion.p key={msg} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 16 }}>{msg}</motion.p>
            <div className="progress-bar max-w-sm mx-auto">
              <div className="progress-fill" style={{ width: prog + '%' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8, opacity: 0.5 }}>
              Image appears in the card below when ready
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)' }}>
              <i className="fa-solid fa-images mr-2" style={{ color: 'var(--primary)' }}></i>
              Generated Images ({images.length})
            </p>
            <button onClick={() => setImages([])}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-trash mr-1"></i> Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {images.map((item, i) => (
              <ImageCard key={item.url} url={item.url} prompt={item.prompt} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default function AIImageGenerator() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <CreditGuard><Content /></CreditGuard>
    </div>
  )
}
