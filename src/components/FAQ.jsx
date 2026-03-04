import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

const FAQS = [
  {
    q: 'Is Transformix really free?',
    a: 'Yes! You get 25 free credits without signing up. Each tool use costs 1 credit. Credits reset every 28 hours. Sign in for 100 credits and 50 resets every 24 hours.',
  },
  {
    q: 'Are my files safe? Do you store them?',
    a: 'Absolutely. All file processing happens 100% in your browser using JavaScript. Your files never leave your device — we never see them, store them, or transmit them.',
  },
  {
    q: 'What file formats are supported?',
    a: 'We support 50+ formats including JPG, PNG, WebP, SVG, GIF, BMP, AVIF, PDF, DOCX, JSON, CSV, TXT, HTML, Markdown, MP3, MP4, and more.',
  },
  {
    q: 'How does the AI image generator work?',
    a: 'We use Google Imagen 3 (via the Gemini API) to generate high-quality images from text prompts. Describe anything and AI will create it in seconds.',
  },
  {
    q: 'Do short links expire?',
    a: 'Links created while signed in are permanent and tracked. Guest links are created in your browser session and stored in our database without expiry.',
  },
  {
    q: 'Can I use this on mobile?',
    a: 'Yes! Transformix is fully responsive and works great on phones and tablets. All tools function the same on any device.',
  },
]

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'

function FAQItem({ item, i }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.07 }}
      className="card overflow-hidden"
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '0.95rem', color: 'var(--text)', paddingRight: 16,
        }}>
          {item.q}
        </span>
        <motion.i
          className="fa-solid fa-chevron-down flex-shrink-0"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ color: 'var(--primary)', fontSize: '0.85rem' }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7,
              padding: '0 1.25rem 1.25rem',
            }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-20 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <motion.p
          className="section-eyebrow"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        >
          FAQ
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'var(--font-display)' }}
        >
          Common <span className="gradient-text">questions</span>
        </motion.h2>
      </div>

      {inView && (
        <div className="flex flex-col gap-3">
          {FAQS.map((item, i) => (
            <FAQItem key={item.q} item={item} i={i} />
          ))}
        </div>
      )}
    </section>
  )
}
