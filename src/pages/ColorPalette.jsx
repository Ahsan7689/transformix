import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useCredit } from '../context/CreditContext'
import CreditGuard from '../components/CreditGuard'

// ─── Color utilities ──────────────────────────────────────────────────────────

function extractColors(imgEl, count = 8) {
  const canvas = document.createElement('canvas')
  const size = 100
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(imgEl, 0, 0, size, size)
  const data = ctx.getImageData(0, 0, size, size).data
  const buckets = {}
  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i]     / 32) * 32
    const g = Math.round(data[i + 1] / 32) * 32
    const b = Math.round(data[i + 2] / 32) * 32
    const a = data[i + 3]
    if (a < 128) continue
    const key = `${r},${g},${b}`
    buckets[key] = (buckets[key] || 0) + 1
  }
  return Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number)
      return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
    })
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CURATED = [
  { name: 'Sunset Vibes',  colors: ['#FF6B6B','#FF8E53','#FFC107','#FF5722','#E91E63'] },
  { name: 'Ocean Breeze',  colors: ['#00B4DB','#0083B0','#48CAE4','#90E0EF','#CAF0F8'] },
  { name: 'Forest Walk',   colors: ['#1B4332','#2D6A4F','#40916C','#74C69D','#B7E4C7'] },
  { name: 'Candy Pop',     colors: ['#FF99C8','#FCF6BD','#D0F4DE','#A9DEF9','#E4C1F9'] },
  { name: 'Midnight',      colors: ['#0a0a0a','#1a1a2e','#16213e','#0f3460','#533483'] },
  { name: 'Golden Hour',   colors: ['#F8C471','#F0B04A','#E67E22','#CA6F1E','#7E5109'] },
  { name: 'Neon City',     colors: ['#FF00FF','#00FFFF','#FF6600','#00FF66','#6600FF'] },
  { name: 'Pastel Dream',  colors: ['#FFDFD3','#FFD6E0','#C7CEEA','#B5EAD7','#FFEAA7'] },
]

const TABS = [
  { key: 'extract',  label: 'Extract',  fullLabel: 'Extract from Image', icon: 'fa-solid fa-image' },
  { key: 'generate', label: 'Generate', fullLabel: 'Generate from Color', icon: 'fa-solid fa-droplet' },
  { key: 'curated',  label: 'Curated',  fullLabel: 'Curated Palettes',   icon: 'fa-solid fa-swatchbook' },
]

// ─── ColorSwatch — responsive, stacks on mobile ───────────────────────────────

function ColorSwatch({ hex }) {
  const [copied, setCopied] = useState(false)
  const [fmt, setFmt] = useState('HEX')

  const getVal = () => fmt === 'HEX' ? hex : fmt === 'RGB' ? hexToRgb(hex) : hexToHsl(hex)

  const copy = (val) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(true)
      toast.success('Copied: ' + val)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{ flex: '1 1 70px', minWidth: 0, cursor: 'pointer' }}
    >
      {/* Color block */}
      <div
        onClick={() => copy(getVal())}
        style={{
          background: hex,
          height: 'clamp(60px, 12vw, 110px)',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        <AnimatePresence>
          {copied && (
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <i className="fa-solid fa-check" style={{ color: 'white', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.6))' }}></i>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HEX label + format buttons */}
      <div style={{ marginTop: 6, textAlign: 'center' }}>
        <p
          onClick={() => copy(hex)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.58rem, 1.5vw, 0.72rem)',
            color: 'var(--text)', fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {hex.toUpperCase()}
        </p>
        {/* Format toggle buttons — hidden on very small screens, shown on sm+ */}
        <div className="hidden sm:flex justify-center gap-1 mt-1 flex-wrap">
          {['HEX','RGB','HSL'].map(f => (
            <button key={f}
              onClick={() => { setFmt(f); copy(f === 'HEX' ? hex : f === 'RGB' ? hexToRgb(hex) : hexToHsl(hex)) }}
              style={{
                fontSize: '0.6rem', padding: '2px 5px', borderRadius: 4, cursor: 'pointer',
                background: fmt === f ? 'var(--primary)' : 'var(--surface-2)',
                color: fmt === f ? '#0a0a0a' : 'var(--text-muted)',
                border: '1px solid ' + (fmt === f ? 'var(--primary)' : 'var(--border)'),
                fontFamily: 'var(--font-mono)', fontWeight: 600,
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function Content() {
  const { useCredit: consume } = useCredit()
  const [tab,     setTab]     = useState('extract')
  const [palette, setPalette] = useState([])
  const [imgSrc,  setImgSrc]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [genBase, setGenBase] = useState('#6366f1')
  const imgRef = useRef(null)

  // ── Extract ──
  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0]
    if (!file) return
    const ok = await consume()
    if (!ok) return toast.error('No credits remaining')
    setLoading(true)
    const url = URL.createObjectURL(file)
    setImgSrc(url)
    const img = new Image()
    img.onload = () => {
      setPalette(extractColors(img, 8))
      setLoading(false)
      toast.success('Palette extracted!')
    }
    img.onerror = () => { setLoading(false); toast.error('Could not read image') }
    img.src = url
  }, [consume])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg','.jpeg','.png','.webp','.gif'] }, multiple: false
  })

  // ── Generate ──
  const generateFromColor = async () => {
    const ok = await consume()
    if (!ok) return toast.error('No credits remaining')
    const r = parseInt(genBase.slice(1,3),16)
    const g = parseInt(genBase.slice(3,5),16)
    const b = parseInt(genBase.slice(5,7),16)
    const out = [genBase]
    for (const f of [0.8,0.6,0.4,0.2]) {
      out.push('#' + [
        Math.round(r+(255-r)*(1-f)),
        Math.round(g+(255-g)*(1-f)),
        Math.round(b+(255-b)*(1-f)),
      ].map(v=>v.toString(16).padStart(2,'0')).join(''))
    }
    for (const f of [0.75,0.5,0.25]) {
      out.push('#' + [Math.round(r*f),Math.round(g*f),Math.round(b*f)]
        .map(v=>v.toString(16).padStart(2,'0')).join(''))
    }
    setPalette(out.slice(0,8))
    toast.success('Palette generated!')
  }

  const exportCSS = () => {
    if (!palette.length) return
    navigator.clipboard.writeText(':root {\n' + palette.map((c,i) => `  --color-${i+1}: ${c};`).join('\n') + '\n}')
    toast.success('CSS variables copied!')
  }

  const exportArray = () => {
    if (!palette.length) return
    navigator.clipboard.writeText(JSON.stringify(palette))
    toast.success('Color array copied!')
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 80px' }}>

      {/* ── Header ── */}
      <div className="tool-header">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(163,185,248,0.12)', border: '1px solid rgba(163,185,248,0.25)', color: '#A3B9F8' }}>
            <i className="fa-solid fa-palette"></i>
          </div>
        </div>
        <h1>Color Palette Generator</h1>
        <p>Extract colors from any image, generate palettes from a base color, or browse curated collections.</p>
      </div>

      {/* ── Tabs — scroll on mobile ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto',
        paddingBottom: 4, WebkitOverflowScrolling: 'touch', justifyContent: 'center', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPalette([]) }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            padding: '9px 14px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'all 0.2s', flexShrink: 0,
            background: tab === t.key ? 'var(--primary)' : 'var(--surface)',
            color: tab === t.key ? '#0a0a0a' : 'var(--text-muted)',
            border: '1px solid ' + (tab === t.key ? 'var(--primary)' : 'var(--border)'),
          }}>
            <i className={t.icon + ' text-xs'}></i>
            {/* Short label on mobile, full on sm+ */}
            <span className="sm:hidden">{t.label}</span>
            <span className="hidden sm:inline">{t.fullLabel}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: Extract ── */}
      {tab === 'extract' && (
        <div>
          <div {...getRootProps()} style={{
            border: '2px dashed ' + (isDragActive ? 'var(--primary)' : 'var(--border)'),
            borderRadius: 'var(--radius-xl)', padding: 'clamp(1.25rem, 5vw, 2.5rem)',
            textAlign: 'center', cursor: 'pointer',
            background: isDragActive ? 'rgba(var(--primary-rgb),0.04)' : 'var(--surface)',
            transition: 'all 0.2s', marginBottom: 20,
          }}>
            <input {...getInputProps()} />
            {imgSrc ? (
              <div className="flex flex-col items-center gap-3">
                <img src={imgSrc} alt="uploaded" ref={imgRef}
                  style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 10, objectFit: 'cover' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Drop another image to re-extract</p>
              </div>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-3xl mb-3" style={{ color: '#A3B9F8', display: 'block' }}></i>
                <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 4, fontSize: 'clamp(0.85rem,3vw,1rem)' }}>
                  {isDragActive ? 'Drop image here...' : 'Tap to browse or drop an image'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>JPG, PNG, WebP, GIF</p>
              </>
            )}
          </div>
          {loading && (
            <div className="text-center py-6">
              <i className="fa-solid fa-spinner fa-spin text-2xl" style={{ color: 'var(--primary)' }}></i>
              <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '0.88rem' }}>Extracting colors...</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Generate ── */}
      {tab === 'generate' && (
        <div className="card p-5 mb-6" style={{ borderRadius: 'var(--radius-xl)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            Pick a base color and we'll generate 8 shades and tints:
          </p>
          {/* Stack vertically on mobile, row on sm+ */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="color" value={genBase} onChange={e => setGenBase(e.target.value)}
                style={{ width: 52, height: 52, borderRadius: 12, border: '2px solid var(--border)',
                  cursor: 'pointer', background: 'none', padding: 2, flexShrink: 0 }} />
              <div>
                <p style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {genBase.toUpperCase()}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Base color</p>
              </div>
            </div>
            <button className="btn-primary" onClick={generateFromColor}
              style={{ padding: '10px 20px', fontSize: '0.88rem', flex: '1 1 auto', justifyContent: 'center' }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i> Generate (1 credit)
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: Curated ── */}
      {tab === 'curated' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {CURATED.map(p => (
            <motion.div key={p.name} whileHover={{ y: -2 }}
              className="card p-4 cursor-pointer"
              style={{ borderRadius: 'var(--radius-xl)' }}
              onClick={() => { setPalette(p.colors); toast.success(p.name + ' selected!') }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)',
                marginBottom: 10, fontSize: '0.86rem' }}>
                {p.name}
              </p>
              <div style={{ display: 'flex', gap: 4 }}>
                {p.colors.map(c => (
                  <div key={c} style={{ flex: 1, height: 36, background: c, borderRadius: 6 }} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Palette Result ── */}
      <AnimatePresence>
        {palette.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>
                <i className="fa-solid fa-palette mr-2" style={{ color: '#A3B9F8' }}></i>
                Your Palette ({palette.length} colors)
              </p>
              {/* Export buttons — stack on tiny screens */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={exportCSS} style={{
                  padding: '7px 12px', borderRadius: 10, fontSize: '0.78rem', cursor: 'pointer',
                  fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  <i className="fa-solid fa-code mr-1"></i>
                  <span className="hidden sm:inline">Copy </span>CSS
                </button>
                <button onClick={exportArray} style={{
                  padding: '7px 12px', borderRadius: 10, fontSize: '0.78rem', cursor: 'pointer',
                  fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  <i className="fa-solid fa-brackets-curly mr-1"></i>
                  <span className="hidden sm:inline">Copy </span>Array
                </button>
              </div>
            </div>

            {/* Swatches — responsive flex wrap */}
            <div className="card p-4 mb-4" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div style={{ display: 'flex', gap: 'clamp(4px, 1.5vw, 12px)', flexWrap: 'nowrap', overflowX: 'auto',
                paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
                {palette.map((hex, i) => <ColorSwatch key={i} hex={hex} />)}
              </div>
            </div>

            {/* Gradient strip */}
            <div style={{
              height: 48, borderRadius: 12, marginBottom: 12,
              background: `linear-gradient(to right, ${palette.join(', ')})`,
              border: '1px solid var(--border)',
            }} />

            {/* Hint */}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center',
              fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
              Tap any swatch to copy HEX
              <span className="hidden sm:inline"> · Use HEX / RGB / HSL buttons for other formats</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ColorPalette() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <CreditGuard><Content /></CreditGuard>
    </div>
  )
}
