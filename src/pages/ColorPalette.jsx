import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useCredit } from '../context/CreditContext'
import CreditGuard from '../components/CreditGuard'

// Extract dominant colors from image using canvas
function extractColors(imgEl, count = 8) {
  const canvas = document.createElement('canvas')
  const size = 100
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(imgEl, 0, 0, size, size)
  const data = ctx.getImageData(0, 0, size, size).data

  // Sample pixels and bucket into color groups
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
      return rgbToHex(r, g, b)
    })
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
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

// Preset curated palettes
const CURATED = [
  { name: 'Sunset Vibes',   colors: ['#FF6B6B','#FF8E53','#FFC107','#FF5722','#E91E63'] },
  { name: 'Ocean Breeze',   colors: ['#00B4DB','#0083B0','#48CAE4','#90E0EF','#CAF0F8'] },
  { name: 'Forest Walk',    colors: ['#1B4332','#2D6A4F','#40916C','#74C69D','#B7E4C7'] },
  { name: 'Candy Pop',      colors: ['#FF99C8','#FCF6BD','#D0F4DE','#A9DEF9','#E4C1F9'] },
  { name: 'Midnight',       colors: ['#0a0a0a','#1a1a2e','#16213e','#0f3460','#533483'] },
  { name: 'Golden Hour',    colors: ['#F8C471','#F0B04A','#E67E22','#CA6F1E','#7E5109'] },
  { name: 'Neon City',      colors: ['#FF00FF','#00FFFF','#FF6600','#00FF66','#6600FF'] },
  { name: 'Pastel Dream',   colors: ['#FFDFD3','#FFD6E0','#C7CEEA','#B5EAD7','#FFEAA7'] },
]

function ColorSwatch({ hex, size = 'md' }) {
  const [copied, setCopied] = useState(false)

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success('Copied: ' + text)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const isLarge = size === 'lg'

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="group relative cursor-pointer flex-1"
      style={{ minWidth: isLarge ? 80 : 60 }}
    >
      {/* Color block */}
      <div
        onClick={() => copy(hex)}
        style={{
          background: hex,
          height: isLarge ? 120 : 80,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        <AnimatePresence>
          {copied && (
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <i className="fa-solid fa-check" style={{ color: 'white', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}></i>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hex label */}
      <div className="mt-2 text-center">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text)', fontWeight: 700 }}>{hex.toUpperCase()}</p>
        {isLarge && (
          <div className="flex justify-center gap-1 mt-1 flex-wrap">
            {['HEX','RGB','HSL'].map(fmt => (
              <button key={fmt} onClick={() => copy(fmt === 'HEX' ? hex : fmt === 'RGB' ? hexToRgb(hex) : hexToHsl(hex))}
                style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: 5, cursor: 'pointer',
                  background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)' }}>
                {fmt}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Content() {
  const { useCredit: consume } = useCredit()
  const [tab,      setTab]      = useState('extract') // extract | curated | generate
  const [palette,  setPalette]  = useState([])
  const [imgSrc,   setImgSrc]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [genBase,  setGenBase]  = useState('#6366f1')
  const imgRef = useRef(null)

  // ── EXTRACT from image ──
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
      const colors = extractColors(img, 8)
      setPalette(colors)
      setLoading(false)
      toast.success('Palette extracted!')
    }
    img.onerror = () => { setLoading(false); toast.error('Could not read image') }
    img.src = url
  }, [consume])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }, multiple: false
  })

  // ── GENERATE from base color ──
  const generateFromColor = async () => {
    const ok = await consume()
    if (!ok) return toast.error('No credits remaining')

    const r = parseInt(genBase.slice(1, 3), 16)
    const g = parseInt(genBase.slice(3, 5), 16)
    const b = parseInt(genBase.slice(5, 7), 16)

    // Generate complementary, analogous, triadic, shades
    const generated = []
    // Original
    generated.push(genBase)
    // Lighter shades
    for (const factor of [0.8, 0.6, 0.4, 0.2]) {
      const nr = Math.round(r + (255 - r) * (1 - factor))
      const ng = Math.round(g + (255 - g) * (1 - factor))
      const nb = Math.round(b + (255 - b) * (1 - factor))
      generated.push(rgbToHex(nr, ng, nb))
    }
    // Darker shades
    for (const factor of [0.75, 0.5, 0.25]) {
      generated.push(rgbToHex(Math.round(r * factor), Math.round(g * factor), Math.round(b * factor)))
    }
    setPalette(generated.slice(0, 8))
    toast.success('Palette generated!')
  }

  const exportCSS = () => {
    if (!palette.length) return
    const css = ':root {\n' + palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n') + '\n}'
    navigator.clipboard.writeText(css)
    toast.success('CSS variables copied!')
  }

  const exportArray = () => {
    if (!palette.length) return
    navigator.clipboard.writeText(JSON.stringify(palette))
    toast.success('Color array copied!')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16">

      {/* Header */}
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

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { key: 'extract',  label: 'Extract from Image', icon: 'fa-solid fa-image' },
          { key: 'generate', label: 'Generate from Color', icon: 'fa-solid fa-droplet' },
          { key: 'curated',  label: 'Curated Palettes',   icon: 'fa-solid fa-swatchbook' },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPalette([]) }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 12, fontSize: '0.83rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'all 0.2s',
            background: tab === t.key ? 'var(--primary)' : 'var(--surface)',
            color: tab === t.key ? '#0a0a0a' : 'var(--text-muted)',
            border: '1px solid ' + (tab === t.key ? 'var(--primary)' : 'var(--border)'),
          }}>
            <i className={t.icon + ' text-xs'}></i>
            <span className="hide-mobile">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: Extract ── */}
      {tab === 'extract' && (
        <div>
          <div {...getRootProps()} style={{
            border: '2px dashed ' + (isDragActive ? 'var(--primary)' : 'var(--border)'),
            borderRadius: 'var(--radius-xl)', padding: '2.5rem', textAlign: 'center',
            cursor: 'pointer', background: isDragActive ? 'rgba(var(--primary-rgb),0.04)' : 'var(--surface)',
            transition: 'all 0.2s', marginBottom: 24,
          }}>
            <input {...getInputProps()} />
            {imgSrc ? (
              <div className="flex flex-col items-center gap-3">
                <img src={imgSrc} alt="uploaded"
                  ref={imgRef}
                  style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 12, objectFit: 'cover' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Drop another image to re-extract</p>
              </div>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-3xl mb-3" style={{ color: '#A3B9F8', display: 'block' }}></i>
                <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>
                  {isDragActive ? 'Drop image here...' : 'Drop an image or click to browse'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>JPG, PNG, WebP, GIF</p>
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
        <div className="card p-6 mb-6" style={{ borderRadius: 'var(--radius-xl)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 16 }}>
            Pick a base color and we'll generate a full palette of shades and tints:
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <input type="color" value={genBase} onChange={e => setGenBase(e.target.value)}
                style={{ width: 56, height: 56, borderRadius: 12, border: '2px solid var(--border)', cursor: 'pointer', background: 'none', padding: 2 }} />
              <div>
                <p style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{genBase.toUpperCase()}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Base color</p>
              </div>
            </div>
            <button className="btn-primary" onClick={generateFromColor} style={{ padding: '10px 22px' }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i> Generate Palette (1 credit)
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: Curated ── */}
      {tab === 'curated' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {CURATED.map(p => (
            <motion.div key={p.name} whileHover={{ y: -2 }}
              className="card p-4 cursor-pointer"
              style={{ borderRadius: 'var(--radius-xl)' }}
              onClick={() => { setPalette(p.colors); toast.success(p.name + ' selected!') }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontSize: '0.88rem' }}>
                {p.name}
              </p>
              <div className="flex gap-1">
                {p.colors.map(c => (
                  <div key={c} style={{ flex: 1, height: 40, background: c, borderRadius: 8 }} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── PALETTE RESULT ── */}
      <AnimatePresence>
        {palette.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)' }}>
                <i className="fa-solid fa-palette mr-2" style={{ color: '#A3B9F8' }}></i>
                Your Palette ({palette.length} colors)
              </p>
              <div className="flex gap-2">
                <button onClick={exportCSS} style={{
                  padding: '7px 14px', borderRadius: 10, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
                  background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                }}>
                  <i className="fa-solid fa-code mr-1"></i> Copy CSS
                </button>
                <button onClick={exportArray} style={{
                  padding: '7px 14px', borderRadius: 10, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
                  background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                }}>
                  <i className="fa-solid fa-brackets-curly mr-1"></i> Copy Array
                </button>
              </div>
            </div>

            {/* Large swatches */}
            <div className="card p-5 mb-4" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="flex gap-3">
                {palette.map((hex, i) => <ColorSwatch key={i} hex={hex} size="lg" />)}
              </div>
            </div>

            {/* Full width gradient preview */}
            <div style={{
              height: 60, borderRadius: 14, marginBottom: 16,
              background: `linear-gradient(to right, ${palette.join(', ')})`,
              border: '1px solid var(--border)',
            }} />

            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              Click any swatch to copy HEX · Use HEX / RGB / HSL buttons for other formats
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
