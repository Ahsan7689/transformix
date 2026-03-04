import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import RotatingText from './RotatingText'
import CircularText from './CircularText'
import { useCredit } from '../context/CreditContext'

// ──────────────────────────────────────────
//  Floating icon definitions  — lots of them
// ──────────────────────────────────────────
const ICONS = [
  // Image formats
  { icon: 'fa-solid fa-file-image', color: '#75BDE0', label: 'PNG' },
  { icon: 'fa-solid fa-image', color: '#F8D49B', label: 'JPG' },
  { icon: 'fa-brands fa-sketch', color: '#F89B9B', label: 'SVG' },
  { icon: 'fa-solid fa-camera', color: '#75BDE0', label: 'RAW' },
  // Document formats
  { icon: 'fa-solid fa-file-pdf', color: '#ef4444', label: 'PDF' },
  { icon: 'fa-solid fa-file-word', color: '#3b82f6', label: 'DOCX' },
  { icon: 'fa-solid fa-file-excel', color: '#22c55e', label: 'XLSX' },
  { icon: 'fa-solid fa-file-powerpoint', color: '#f97316', label: 'PPTX' },
  { icon: 'fa-solid fa-file-alt', color: '#a855f7', label: 'TXT' },
  { icon: 'fa-solid fa-file-code', color: '#F8D49B', label: 'HTML' },
  // Video formats
  { icon: 'fa-solid fa-film', color: '#75BDE0', label: 'MP4' },
  { icon: 'fa-solid fa-video', color: '#F89B9B', label: 'MOV' },
  { icon: 'fa-solid fa-clapperboard', color: '#F8D49B', label: 'AVI' },
  // Audio formats
  { icon: 'fa-solid fa-music', color: '#75BDE0', label: 'MP3' },
  { icon: 'fa-solid fa-headphones', color: '#F8D49B', label: 'WAV' },
  { icon: 'fa-solid fa-wave-square', color: '#F89B9B', label: 'FLAC' },
  // Archive
  { icon: 'fa-solid fa-file-zipper', color: '#a855f7', label: 'ZIP' },
  { icon: 'fa-solid fa-box-archive', color: '#F8D49B', label: 'RAR' },
  // Web / link
  { icon: 'fa-solid fa-link', color: '#75BDE0', label: 'URL' },
  { icon: 'fa-solid fa-globe', color: '#F89B9B', label: 'WEB' },
  { icon: 'fa-solid fa-qrcode', color: '#F8D49B', label: 'QR' },
  // Data
  { icon: 'fa-solid fa-database', color: '#75BDE0', label: 'SQL' },
  { icon: 'fa-solid fa-file-csv', color: '#22c55e', label: 'CSV' },
  { icon: 'fa-solid fa-brackets-curly', color: '#F8D49B', label: 'JSON' },
  // AI / magic
  { icon: 'fa-solid fa-wand-magic-sparkles', color: '#F89B9B', label: 'AI' },
  { icon: 'fa-solid fa-robot', color: '#75BDE0', label: 'GEN' },
  { icon: 'fa-solid fa-sparkles', color: '#F8D49B', label: 'IMG' },
  // Security
  { icon: 'fa-solid fa-shield-halved', color: '#75BDE0', label: 'META' },
  { icon: 'fa-solid fa-lock', color: '#F89B9B', label: 'ENC' },
  // More formats
  { icon: 'fa-solid fa-file-lines', color: '#F8D49B', label: 'MD' },
  { icon: 'fa-solid fa-cube', color: '#75BDE0', label: '3D' },
  { icon: 'fa-solid fa-compress-arrows-alt', color: '#F89B9B', label: 'GZ' },
]

// Scatter positions across the viewport
const generatePositions = (count) => {
  const positions = []
  // Left cluster
  for (let i = 0; i < Math.floor(count * 0.35); i++) {
    positions.push({
      x: Math.random() * 18 + 1,
      y: Math.random() * 85 + 5,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 8,
      size: 40 + Math.random() * 20,
      opacity: 0.12 + Math.random() * 0.22,
      animType: Math.floor(Math.random() * 3),
    })
  }
  // Right cluster
  for (let i = 0; i < Math.floor(count * 0.35); i++) {
    positions.push({
      x: Math.random() * 18 + 80,
      y: Math.random() * 85 + 5,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 8,
      size: 40 + Math.random() * 20,
      opacity: 0.12 + Math.random() * 0.22,
      animType: Math.floor(Math.random() * 3),
    })
  }
  // Scattered rest
  for (let i = 0; i < count - positions.length; i++) {
    positions.push({
      x: Math.random() * 100,
      y: Math.random() * 85 + 5,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 8,
      size: 35 + Math.random() * 25,
      opacity: 0.08 + Math.random() * 0.14,
      animType: Math.floor(Math.random() * 3),
    })
  }
  return positions
}

const POSITIONS = generatePositions(ICONS.length)

const ANIM_TYPES = [
  { animation: 'float-up-down', timing: 'ease-in-out' },
  { animation: 'float-left-right', timing: 'ease-in-out' },
  { animation: 'drift', timing: 'ease-in-out' },
]

const SERVICES = [
  { to: '/img-to-pdf',  icon: 'fa-solid fa-file-pdf',            label: 'Image to PDF',    color: '#ef4444', desc: 'Merge images into a single PDF instantly' },
  { to: '/convert',     icon: 'fa-solid fa-shuffle',              label: 'File Converter',  color: '#75BDE0', desc: 'Convert 50+ formats in your browser' },
  { to: '/shorten',     icon: 'fa-solid fa-link',                 label: 'Link Shortener',  color: '#F8D49B', desc: 'Shorten & track your URLs' },
  { to: '/metadata',    icon: 'fa-solid fa-shield-halved',        label: 'Metadata Remover',color: '#a855f7', desc: 'Strip hidden data from files' },
  { to: '/compress',    icon: 'fa-solid fa-compress-arrows-alt',  label: 'Image Compressor',color: '#9BF8D0', desc: 'Shrink images up to 90% smaller' },
  { to: '/qr',          icon: 'fa-solid fa-qrcode',               label: 'QR Generator',    color: '#F8E3A3', desc: 'Generate QR codes for anything' },
  { to: '/palette',     icon: 'fa-solid fa-palette',              label: 'Color Palette',   color: '#A3B9F8', desc: 'Extract & generate color palettes' },
]

export default function Hero() {
  const { credits } = useCredit()
  const heroRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Entrance animations for service cards
    gsap.fromTo('.service-card',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.8 }
    )
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ paddingTop: '100px', paddingBottom: '4rem' }}
    >
      {/* ── Floating icons background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {ICONS.map((item, i) => {
          const pos = POSITIONS[i % POSITIONS.length]
          const anim = ANIM_TYPES[pos.animType]
          return (
            <div
              key={i}
              className="floating-icon"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: pos.size,
                height: pos.size,
                background: `${item.color}14`,
                border: `1px solid ${item.color}28`,
                color: item.color,
                opacity: pos.opacity,
                animation: `${anim.animation} ${pos.duration}s ${anim.timing} ${pos.delay}s infinite`,
              }}
            >
              <i className={`${item.icon} text-base`}></i>
            </div>
          )
        })}
      </div>

      {/* ── Gradient blob background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          style={{
            position: 'absolute',
            width: '60vw', height: '60vw',
            maxWidth: 700, maxHeight: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--primary-rgb),0.12) 0%, transparent 70%)',
            top: '10%', left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '40vw', height: '40vw',
            maxWidth: 500, maxHeight: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.08) 0%, transparent 70%)',
            bottom: '5%', right: '10%',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className="pill">
            <span className="dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            All-in-One Toolkit
          </span>
          {credits !== null && (
            <div className="credit-badge">
              <span className="dot" />
              {credits} credits free
            </div>
          )}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            marginBottom: '1rem',
          }}
        >
          Transform anything.
          <br />
          <span className="gradient-text">Instantly.</span>
        </motion.h1>

        {/* Rotating subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex items-center justify-center gap-3 mb-4"
          style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
        >
          <span>Convert, Compress &</span>
          <span
            className="inline-flex items-center justify-center rounded-xl px-4 py-1 overflow-hidden"
            style={{
              background: 'rgba(var(--primary-rgb), 0.12)',
              border: '1px solid rgba(var(--primary-rgb), 0.25)',
              color: 'var(--primary)',
              minWidth: '160px',
              height: '44px',
            }}
          >
            <RotatingText
              texts={['Convert', 'Compress', 'Shorten', 'Clean', 'Protect', 'Design']}
              mainClassName=""
              splitBy="characters"
              staggerFrom="first"
              staggerDuration={0.03}
              rotationInterval={2400}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            />
          </span>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.65 }}
        >
          7 powerful browser-based tools — convert files, compress images, generate QR codes, extract color palettes, shorten links and more. All free, no sign-up required.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-4"
        >
          <Link to="/convert" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            <i className="fa-solid fa-rocket"></i>
            Start for Free
          </Link>
          <Link to="/compress" className="btn-outline" style={{ fontSize: '1rem', padding: '13px 28px' }}>
            <i className="fa-solid fa-compress-arrows-alt"></i>
            Compress Images
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
        >
          <i className="fa-solid fa-bolt text-[var(--accent)] mr-1"></i>
          25 free credits · No signup needed · Resets every 28 hours
        </motion.p>
      </div>

      {/* ── Service cards grid ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="section-eyebrow text-center mb-8"
        >
          7 tools · everything you need
        </motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {SERVICES.map((svc, i) => (
            <Link key={svc.to} to={svc.to} className="service-card no-underline" style={{ textDecoration: 'none', opacity: 0 }}>
              <div
                className="card h-full flex flex-col items-center text-center p-5 gap-3 cursor-pointer group"
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{
                    background: `${svc.color}18`,
                    border: `1px solid ${svc.color}30`,
                    color: svc.color,
                    fontSize: '1.25rem',
                  }}
                >
                  <i className={svc.icon}></i>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 4 }}>
                    {svc.label}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                    {svc.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Circular text decoration */}
      <div className="hide-mobile" style={{ position: 'absolute', bottom: '4rem', right: '4rem', opacity: 0.6 }}>
        <CircularText
          text="CONVERT • COMPRESS • CREATE • TRANSFORM • "
          spinDuration={28}
          onHover="speedUp"
        />
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <i className="fa-solid fa-chevron-down text-xs"></i>
        </motion.div>
      </motion.div>
    </section>
  )
}
