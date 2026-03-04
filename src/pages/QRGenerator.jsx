import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'
import { useCredit } from '../context/CreditContext'
import CreditGuard from '../components/CreditGuard'

const PRESETS = [
  { label: 'URL',   icon: 'fa-solid fa-link',       placeholder: 'https://example.com',  prefix: '' },
  { label: 'Text',  icon: 'fa-solid fa-font',        placeholder: 'Enter any text...',    prefix: '' },
  { label: 'Email', icon: 'fa-solid fa-envelope',    placeholder: 'email@example.com',    prefix: 'mailto:' },
  { label: 'Phone', icon: 'fa-solid fa-phone',       placeholder: '+92 300 0000000',      prefix: 'tel:' },
  { label: 'SMS',   icon: 'fa-solid fa-comment-sms', placeholder: '+92 300 0000000',      prefix: 'sms:' },
  { label: 'WiFi',  icon: 'fa-solid fa-wifi',        placeholder: 'NetworkName',          prefix: '' },
]

const COLORS = [
  { fg: '#000000', bg: '#ffffff', label: 'Classic' },
  { fg: '#1a1a2e', bg: '#ffffff', label: 'Navy' },
  { fg: '#F89B9B', bg: '#0a0a0a', label: 'Rose Dark' },
  { fg: '#9BF8D0', bg: '#0a0a0a', label: 'Mint Dark' },
  { fg: '#6366f1', bg: '#ffffff', label: 'Indigo' },
  { fg: '#f59e0b', bg: '#1c1917', label: 'Amber Dark' },
]

const SIZES = [128, 256, 512, 1024]

function Content() {
  const { useCredit: consume } = useCredit()
  const qrContainerRef = useRef(null)   // always-mounted div
  const qrInstanceRef  = useRef(null)
  const qrLibRef       = useRef(null)

  const [libReady,  setLibReady]  = useState(false)
  const [preset,    setPreset]    = useState(PRESETS[0])
  const [input,     setInput]     = useState('')
  const [wifi,      setWifi]      = useState({ ssid: '', pass: '', enc: 'WPA' })
  const [size,      setSize]      = useState(256)
  const [color,     setColor]     = useState(COLORS[0])
  const [generated, setGenerated] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState(null)

  // Load QRCode.js from CDN once on mount
  useEffect(() => {
    if (window.QRCode) { qrLibRef.current = window.QRCode; setLibReady(true); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    script.onload = () => { qrLibRef.current = window.QRCode; setLibReady(true) }
    script.onerror = () => toast.error('Failed to load QR library. Check your internet connection.')
    document.head.appendChild(script)
  }, [])

  const getValue = () => {
    if (preset.label === 'WiFi') return `WIFI:T:${wifi.enc};S:${wifi.ssid};P:${wifi.pass};;`
    return preset.prefix + input.trim()
  }

  const generate = async () => {
    const val = getValue()
    if (!val || (preset.label === 'WiFi' && !wifi.ssid)) return toast.error('Please fill in the required field')
    if (!libReady || !qrLibRef.current) return toast.error('QR library still loading, please wait a moment...')
    if (!qrContainerRef.current) return toast.error('Component not ready, please try again.')

    const ok = await consume()
    if (!ok) return toast.error('No credits remaining')

    // Clear previous QR
    qrContainerRef.current.innerHTML = ''
    if (qrInstanceRef.current) {
      try { qrInstanceRef.current.clear() } catch {}
      qrInstanceRef.current = null
    }

    try {
      qrInstanceRef.current = new qrLibRef.current(qrContainerRef.current, {
        text: val,
        width: size,
        height: size,
        colorDark: color.fg,
        colorLight: color.bg,
        correctLevel: qrLibRef.current.CorrectLevel.H,
      })

      // Small delay to let QRCode.js render canvas/img, then grab data URL
      setTimeout(() => {
        const canvas = qrContainerRef.current?.querySelector('canvas')
        const img    = qrContainerRef.current?.querySelector('img')
        if (canvas) {
          setQrDataUrl(canvas.toDataURL('image/png'))
        } else if (img) {
          setQrDataUrl(img.src)
        }
        setGenerated(true)
        toast.success('QR Code generated!')
      }, 200)
    } catch (e) {
      toast.error('Generation failed. Try shorter text.')
    }
  }

  const download = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = 'transformix-qr-' + Date.now() + '.png'
    a.click()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16">

      {/* Header */}
      <div className="tool-header">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(248,227,163,0.12)', border: '1px solid rgba(248,227,163,0.25)', color: '#F8E3A3' }}>
            <i className="fa-solid fa-qrcode"></i>
          </div>
        </div>
        <h1>QR Code Generator</h1>
        <p>Generate QR codes for URLs, text, email, phone, WiFi and more — free, instant, no sign-up needed.</p>
      </div>

      {/* Lib loading indicator */}
      {!libReady && (
        <div className="text-center mb-6">
          <i className="fa-solid fa-spinner fa-spin mr-2" style={{ color: 'var(--primary)' }}></i>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading QR library...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── LEFT: Controls ── */}
        <div>
          {/* Type tabs */}
          <div className="mb-5">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 10 }}>QR Type</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button key={p.label}
                  onClick={() => { setPreset(p); setInput(''); setGenerated(false); setQrDataUrl(null) }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 13px', borderRadius: 10, fontSize: '0.82rem',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'all 0.2s',
                    background: preset.label === p.label ? 'var(--primary)' : 'var(--surface)',
                    color:      preset.label === p.label ? '#0a0a0a'        : 'var(--text-muted)',
                    border: '1px solid ' + (preset.label === p.label ? 'var(--primary)' : 'var(--border)'),
                  }}>
                  <i className={p.icon + ' text-xs'}></i> {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="card p-5 mb-4" style={{ borderRadius: 'var(--radius-xl)' }}>
            {preset.label === 'WiFi' ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                    Network Name (SSID) *
                  </label>
                  <input className="input-field" placeholder="MyWiFiNetwork"
                    value={wifi.ssid} onChange={e => setWifi(w => ({ ...w, ssid: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                    Password
                  </label>
                  <input className="input-field" type="password" placeholder="WiFi password"
                    value={wifi.pass} onChange={e => setWifi(w => ({ ...w, pass: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                    Encryption
                  </label>
                  <select className="input-field" style={{ width: 'auto' }}
                    value={wifi.enc} onChange={e => setWifi(w => ({ ...w, enc: e.target.value }))}>
                    <option value="WPA">WPA / WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                  <i className={preset.icon + ' mr-1'}></i> {preset.label}
                  {preset.prefix && (
                    <span style={{ opacity: 0.5, marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                      {preset.prefix}...
                    </span>
                  )}
                </label>
                <input className="input-field" placeholder={preset.placeholder}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generate()} />
              </div>
            )}
          </div>

          {/* Size */}
          <div className="card p-5 mb-4" style={{ borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 10 }}>
              Size: <strong style={{ color: 'var(--text)' }}>{size} × {size}px</strong>
            </p>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map(s => (
                <button key={s} onClick={() => setSize(s)} style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: '0.8rem',
                  cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s',
                  background: size === s ? 'var(--primary)' : 'var(--surface-2)',
                  color:      size === s ? '#0a0a0a'        : 'var(--text-muted)',
                  border: '1px solid ' + (size === s ? 'var(--primary)' : 'var(--border)'),
                }}>
                  {s}px
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="card p-5 mb-5" style={{ borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 10 }}>Color theme</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c.label} onClick={() => setColor(c)} title={c.label} style={{
                  width: 38, height: 38, borderRadius: 8, cursor: 'pointer',
                  background: c.bg, border: '3px solid ' + (color.label === c.label ? 'var(--primary)' : c.fg),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: c.fg }} />
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary w-full"
            onClick={generate}
            disabled={!libReady}
            style={{ padding: '12px', fontSize: '0.95rem', justifyContent: 'center', opacity: libReady ? 1 : 0.6 }}
          >
            <i className="fa-solid fa-qrcode"></i>
            {libReady ? ' Generate QR Code (1 credit)' : ' Loading library...'}
          </button>
        </div>

        {/* ── RIGHT: Preview ── */}
        <div className="flex flex-col items-center">
          <div className="card p-6 flex flex-col items-center justify-center w-full"
            style={{ borderRadius: 'var(--radius-xl)', minHeight: 340 }}>

            {/* Always-mounted QR render target (hidden until generated) */}
            <div
              ref={qrContainerRef}
              style={{ display: generated ? 'block' : 'none', lineHeight: 0, borderRadius: 8, overflow: 'hidden' }}
            />

            {!generated && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(248,227,163,0.08)', border: '2px dashed rgba(248,227,163,0.25)' }}>
                  <i className="fa-solid fa-qrcode text-3xl" style={{ color: 'rgba(248,227,163,0.35)' }}></i>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Fill in the details and click<br />
                  <strong style={{ color: 'var(--text)' }}>Generate QR Code</strong>
                </p>
              </div>
            )}
          </div>

          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 mt-4 w-full"
            >
              <button className="btn-primary w-full" onClick={download}
                style={{ padding: '10px', justifyContent: 'center' }}>
                <i className="fa-solid fa-download"></i> Download PNG
              </button>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                {size}px · {color.label} · Scan with any camera app
              </p>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  )
}

export default function QRGenerator() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <CreditGuard><Content /></CreditGuard>
    </div>
  )
}
