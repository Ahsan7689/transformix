import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: 'fa-solid fa-shuffle',
    label: 'File Converter',
    to: '/convert',
    color: '#75BDE0',
    desc: 'Convert between 50+ formats. Images, documents, audio, video — we handle it all with blazing speed right in your browser.',
    formats: ['PNG→JPG', 'PDF→DOCX', 'MP4→GIF', 'SVG→PNG', '+40 more'],
    stat: '50+',
    statLabel: 'Formats supported',
  },
  {
    icon: 'fa-solid fa-file-pdf',
    label: 'Image to PDF',
    to: '/img-to-pdf',
    color: '#ef4444',
    desc: 'Drag in your images — JPG, PNG, WebP — and merge them into a perfectly sized PDF. Reorder, resize, and export instantly.',
    formats: ['JPG', 'PNG', 'WebP', 'AVIF', 'HEIC'],
    stat: '∞',
    statLabel: 'Pages per PDF',
  },
  {
    icon: 'fa-solid fa-link',
    label: 'Link Shortener',
    to: '/shorten',
    color: '#F8D49B',
    desc: 'Shorten long URLs and track clicks. Get clean, memorable short links that you can share anywhere in seconds.',
    formats: ['Custom slugs', 'Click tracking', 'QR codes', 'Expiry dates'],
    stat: '<1s',
    statLabel: 'Generation time',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    label: 'Metadata Remover',
    to: '/metadata',
    color: '#a855f7',
    desc: 'Strip EXIF data, GPS coordinates, timestamps, and camera info from images and documents before sharing.',
    formats: ['JPEG EXIF', 'PNG tEXt', 'PDF metadata', 'MP3 ID3'],
    stat: '100%',
    statLabel: 'Privacy guaranteed',
  },
  {
    icon: 'fa-solid fa-compress-arrows-alt',
    label: 'Image Compressor',
    to: '/compress',
    color: '#9BF8D0',
    desc: 'Compress JPG, PNG and WebP images directly in your browser. Reduce file size by up to 90% with full quality control — completely private, nothing leaves your device.',
    formats: ['JPG', 'PNG', 'WebP', 'GIF', 'BMP'],
    stat: '90%',
    statLabel: 'Average size reduction',
  },
  {
    icon: 'fa-solid fa-qrcode',
    label: 'QR Code Generator',
    to: '/qr',
    color: '#F8E3A3',
    desc: 'Generate QR codes for URLs, text, email, phone, WiFi and more. Choose size, colors, and download as a high-resolution PNG instantly.',
    formats: ['URL', 'Text', 'Email', 'Phone', 'WiFi', 'SMS'],
    stat: '1024px',
    statLabel: 'Max export resolution',
  },
]

function FeatureCard({ feature, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={feature.to} style={{ textDecoration: 'none' }}>
        <div
          className="card h-full flex flex-col gap-5 p-6 group cursor-pointer"
          style={{ borderRadius: 'var(--radius-xl)', minHeight: 280 }}
        >
          {/* Icon + stat */}
          <div className="flex items-start justify-between">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: `${feature.color}18`,
                border: `1.5px solid ${feature.color}30`,
                color: feature.color,
                fontSize: '1.4rem',
              }}
            >
              <i className={feature.icon}></i>
            </div>
            <div className="text-right">
              <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.5rem', color: feature.color, lineHeight: 1 }}>
                {feature.stat}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{feature.statLabel}</p>
            </div>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: 8 }}>
              {feature.label}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>
              {feature.desc}
            </p>
          </div>

          {/* Format pills */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {feature.formats.map(fmt => (
              <span key={fmt} className="fmt-badge">{fmt}</span>
            ))}
          </div>

          {/* CTA */}
          <div
            className="flex items-center gap-2 font-semibold text-sm transition-all"
            style={{ fontFamily: 'var(--font-display)', color: feature.color }}
          >
            Use tool
            <motion.i
              className="fa-solid fa-arrow-right text-xs"
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Features() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true })

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Section header */}
      <div ref={titleRef} className="text-center mb-14">
        <motion.p
          className="section-eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          The full toolkit
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'var(--font-display)' }}
        >
          Five tools.{' '}
          <span className="gradient-text">One platform.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={titleInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '1rem auto 0', lineHeight: 1.65 }}
        >
          Everything you need to work with files, images, and links — all in one beautifully designed toolkit.
        </motion.p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.to} feature={f} i={i} />
        ))}
      </div>
    </section>
  )
}
