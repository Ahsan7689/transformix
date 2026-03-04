import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 7,     suffix: '+',   label: 'Powerful Tools',  icon: 'fa-solid fa-toolbox',      color: '#75BDE0' },
  { value: 50,    suffix: '+',   label: 'File Formats',    icon: 'fa-solid fa-file',          color: '#F8D49B' },
  { value: 100,   suffix: '%',   label: 'Free Forever',    icon: 'fa-solid fa-heart',         color: '#F89B9B' },
  { value: 0,     suffix: '',    label: 'Server Uploads',  icon: 'fa-solid fa-cloud-slash',   color: '#9BF8D0' },
]

const TOOLS = [
  { to: '/convert',    icon: 'fa-solid fa-shuffle',             label: 'File Converter',   color: '#75BDE0', desc: '50+ formats, fully in-browser' },
  { to: '/img-to-pdf', icon: 'fa-solid fa-file-pdf',            label: 'Image → PDF',      color: '#ef4444', desc: 'Merge & export images as PDF' },
  { to: '/shorten',    icon: 'fa-solid fa-link',                label: 'Link Shortener',   color: '#F8D49B', desc: 'Shorten & track your URLs' },
  { to: '/metadata',   icon: 'fa-solid fa-shield-halved',       label: 'Metadata Remover', color: '#a855f7', desc: 'Strip hidden EXIF data privately' },
  { to: '/compress',   icon: 'fa-solid fa-compress-arrows-alt', label: 'Image Compressor', color: '#9BF8D0', desc: 'Up to 90% size reduction' },
  { to: '/qr',         icon: 'fa-solid fa-qrcode',              label: 'QR Generator',     color: '#F8E3A3', desc: 'URL, WiFi, Email & more' },
  { to: '/palette',    icon: 'fa-solid fa-palette',             label: 'Color Palette',    color: '#A3B9F8', desc: 'Extract & generate palettes' },
]

const CREATORS = [
  {
    name: 'Muhammad Ahsan',
    initials: 'MA',
    role: 'Full-Stack Developer & Co-Founder',
    color: '#75BDE0',
    bio: 'Passionate full-stack developer building high-performance web apps. Loves clean architecture, smooth animations, and tools that solve real problems.',
    skills: ['React', 'Node.js', 'Supabase', 'GSAP', 'System Design', 'Vite'],
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Syeda Nimra',
    initials: 'SN',
    role: 'Frontend Developer & Co-Founder',
    color: '#F89B9B',
    bio: 'Frontend developer who obsesses over pixel-perfect UIs and buttery-smooth experiences. Crafts interfaces that feel great on every screen and device.',
    skills: ['React', 'Tailwind CSS', 'Responsive Design', 'Component Systems', 'UI/UX', 'Web Performance'],
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
]

const TIMELINE = [
  { date: 'December 2025', icon: 'fa-solid fa-lightbulb', color: '#75BDE0',
    title: 'The Idea is Born',
    desc: 'Frustrated with jumping between 10+ websites to convert a file or shorten a link, Ahsan and Nimra decided to build one free, unified toolkit — no ads, no paywalls, ever.' },
  { date: 'January 2026', icon: 'fa-solid fa-code', color: '#F8D49B',
    title: 'Development Begins',
    desc: 'React + Vite + Supabase stack chosen. File Converter and Image to PDF were the first two tools — completed and polished within the first two weeks.' },
  { date: 'February 2026', icon: 'fa-solid fa-wrench', color: '#9BF8D0',
    title: 'Tools Keep Shipping',
    desc: 'Link Shortener, Metadata Remover, Image Compressor, QR Generator, and Color Palette Generator all launched. Seven fully working tools, zero compromises.' },
  { date: 'March 2026', icon: 'fa-solid fa-rocket', color: '#a855f7',
    title: 'Public Launch',
    desc: 'Transformix goes live on Vercel. 7 tools, dual theme, per-user credit system, smooth animations — all completely free. Built in 3 months, free forever.' },
]

const TECH = [
  { name: 'React 18',               icon: 'fa-brands fa-react',              color: '#61DAFB' },
  { name: 'Vite 5',                 icon: 'fa-solid fa-bolt',                color: '#FFD62E' },
  { name: 'Supabase',               icon: 'fa-solid fa-database',            color: '#3ECF8E' },
  { name: 'Framer Motion',          icon: 'fa-solid fa-film',                color: '#F89B9B' },
  { name: 'GSAP',                   icon: 'fa-solid fa-wand-magic-sparkles', color: '#88CE02' },
  { name: 'Lenis Scroll',           icon: 'fa-solid fa-scroll',              color: '#75BDE0' },
  { name: 'Tailwind CSS',           icon: 'fa-solid fa-paintbrush',          color: '#38BDF8' },
  { name: 'FFmpeg WASM',            icon: 'fa-solid fa-clapperboard',        color: '#F8D49B' },
  { name: 'jsPDF',                  icon: 'fa-solid fa-file-pdf',            color: '#ef4444' },
  { name: 'QRCode.js',              icon: 'fa-solid fa-qrcode',              color: '#F8E3A3' },
  { name: 'Canvas API',             icon: 'fa-solid fa-palette',             color: '#A3B9F8' },
  { name: 'browser-image-compress', icon: 'fa-solid fa-compress-arrows-alt', color: '#9BF8D0' },
]

const VALUES = [
  { icon: 'fa-solid fa-lock-open',     color: '#75BDE0', title: 'Always Free',
    desc: 'No paywalls, no subscriptions, no credit card. 25 free credits refresh every 28 hours. Sign in for 100 credits every 24 hours.' },
  { icon: 'fa-solid fa-shield-halved', color: '#9BF8D0', title: 'Privacy First',
    desc: 'All processing runs in your browser using WebAssembly and native browser APIs. Your files never touch our servers — zero uploads, guaranteed.' },
  { icon: 'fa-solid fa-bolt',          color: '#F8D49B', title: 'Instant Results',
    desc: 'No waiting, no queues. Files are processed locally at full browser speed — results ready in seconds, not minutes.' },
  { icon: 'fa-solid fa-mobile-screen', color: '#F89B9B', title: 'Works Everywhere',
    desc: 'Fully responsive — Transformix looks and works great on desktop, tablet, and mobile. One experience, every device.' },
  { icon: 'fa-solid fa-code-branch',   color: '#A3B9F8', title: 'Open Source',
    desc: 'Transformix is open source and community-driven. Found a bug or have a feature idea? Contributions are always welcome.' },
  { icon: 'fa-solid fa-swatchbook',    color: '#F8E3A3', title: 'Beautifully Designed',
    desc: 'Dark mode by default, smooth animations, and a polished UI. A tool can be powerful and beautiful at the same time.' },
]

const REVIEWS = [
  { name: 'Sarah K.',    role: 'Graphic Designer',        avatar: 'SK', color: '#75BDE0',
    text: 'Finally one place for all my file tools. The image compressor alone saves me 10 minutes a day. Clean UI, no distractions.' },
  { name: 'Ahmed R.',    role: 'Software Engineer',       avatar: 'AR', color: '#9BF8D0',
    text: 'The QR generator with WiFi support is exactly what I needed for client setups. Works offline in the browser, brilliant.' },
  { name: 'Priya M.',    role: 'Content Creator',         avatar: 'PM', color: '#F89B9B',
    text: 'I use the metadata remover before every photo upload. Knowing nothing leaves my device gives me real peace of mind.' },
  { name: 'James T.',    role: 'Freelance Developer',     avatar: 'JT', color: '#F8E3A3',
    text: 'Color Palette Generator is my secret weapon. Extracting brand colors from a client\'s logo in two clicks? Yes please.' },
  { name: 'Fatima A.',   role: 'Marketing Manager',       avatar: 'FA', color: '#A3B9F8',
    text: 'Link shortener with click tracking — exactly what I needed for campaigns. No account needed and it actually works fast.' },
  { name: 'Daniel L.',   role: 'UI/UX Designer',          avatar: 'DL', color: '#F8D49B',
    text: 'The design of Transformix itself is inspiring. Dark mode, smooth animations, everything just feels right. Great work.' },
]

const COMPARISON = [
  { feature: '100% Free',            transformix: true,  others: false },
  { feature: 'No Account Required',  transformix: true,  others: false },
  { feature: 'Files Stay on Device', transformix: true,  others: false },
  { feature: '7 Tools in One Place', transformix: true,  others: false },
  { feature: 'No Ads Ever',          transformix: true,  others: false },
  { feature: 'Dark Mode',            transformix: true,  others: 'partial' },
  { feature: 'Open Source',          transformix: true,  others: false },
  { feature: 'Mobile Friendly',      transformix: true,  others: 'partial' },
]

const FAQS = [
  { q: 'Is Transformix completely free?',
    a: 'Yes — always. You get 25 free credits with no account needed, refreshing every 28 hours. Sign in for 100 credits refreshing every 24 hours. No hidden fees, ever.' },
  { q: 'Are my files kept private?',
    a: 'Completely. Every tool runs in your browser using WebAssembly or native browser APIs. Nothing is uploaded to any server — your files never leave your device.' },
  { q: 'What tools are available right now?',
    a: 'Transformix has 7 tools: File Converter (50+ formats), Image to PDF, Link Shortener, Metadata Remover, Image Compressor, QR Code Generator, and Color Palette Generator.' },
  { q: 'Do I need to create an account?',
    a: 'No. All 7 tools work with 25 free guest credits. Create a free account to unlock 100 credits, save your short links, and access your profile dashboard.' },
  { q: 'When was Transformix built?',
    a: 'Started December 2025, launched publicly March 2026. Built by two developers in just 3 months.' },
  { q: 'Will more tools be added?',
    a: 'Absolutely! We are actively building new tools based on community feedback. Open a GitHub issue to suggest your next favourite tool.' },
]

// ─── Reusable helpers ─────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

// Animated counter
function AnimatedNumber({ target, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (target === 0) { setCount(0); return }
    let start = 0
    const step = Math.ceil(target / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 30)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', paddingRight: 16 }}>
          {item.q}
        </span>
        <motion.i className="fa-solid fa-chevron-down flex-shrink-0"
          animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}
          style={{ color: 'var(--primary)', fontSize: '0.85rem' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} style={{ overflow: 'hidden' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, padding: '0 1.25rem 1.25rem' }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function About() {
  return (
    <div style={{ paddingTop: '80px' }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(var(--primary-rgb),0.12), transparent)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <span className="pill mb-5" style={{ display: 'inline-flex' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', marginRight: 8 }} />
              About Transformix
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.8rem)',
              fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1.25rem', marginTop: '1rem' }}>
              Built by developers,<br />
              <span className="gradient-text">for everyone.</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 2.5rem' }}>
              Transformix was born from a simple frustration — why jump between 10 different websites to convert a file,
              shorten a link, or compress an image? We built one place that does it all,
              beautifully, instantly, and completely free.
            </p>
          </FadeIn>

          {/* Animated stat counters */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              {STATS.map(s => (
                <div key={s.label} className="stat-card">
                  <i className={s.icon + ' text-xl mb-3'} style={{ color: s.color, display: 'block' }}></i>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '2.2rem', color: 'var(--text)', lineHeight: 1 }}>
                    <AnimatedNumber target={s.value} suffix={s.suffix} />
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ ALL 7 TOOLS ═══════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="section-eyebrow">The Toolkit</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            7 tools. <span className="gradient-text">One platform.</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 10, fontSize: '0.95rem', maxWidth: 440, margin: '10px auto 0' }}>
            Every tool runs 100% in your browser — no server, no uploads, total privacy.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TOOLS.map((t, i) => (
            <FadeIn key={t.to} delay={i * 0.06}>
              <Link to={t.to} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="card p-5 flex items-center gap-4 h-full cursor-pointer"
                  style={{ borderRadius: 'var(--radius-lg)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: t.color + '18', border: '1px solid ' + t.color + '30', color: t.color }}>
                    <i className={t.icon}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: 3 }}>
                      {t.label}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem', lineHeight: 1.5 }}>{t.desc}</p>
                  </div>
                  <i className="fa-solid fa-arrow-right text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}></i>
                </motion.div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ OUR VALUES ════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="section-eyebrow">What We Stand For</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            Our <span className="gradient-text">core values</span>
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.07}>
              <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="card p-6 h-full" style={{ borderRadius: 'var(--radius-xl)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-4"
                  style={{ background: v.color + '18', color: v.color, border: '1px solid ' + v.color + '28' }}>
                  <i className={v.icon}></i>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  {v.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.88rem' }}>{v.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ COMPARISON TABLE ══════════════════════════════════════════════════ */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="section-eyebrow">Why Transformix?</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            Us vs <span className="gradient-text">the rest</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 10, fontSize: '0.9rem' }}>
            How Transformix stacks up against typical online file tools.
          </p>
        </FadeIn>
        <FadeIn>
          <div className="card overflow-hidden" style={{ borderRadius: 'var(--radius-xl)' }}>
            {/* Header */}
            <div className="grid grid-cols-3 p-4 px-6"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Feature</p>
              <p className="text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                <i className="fa-solid fa-bolt mr-1"></i> Transformix
              </p>
              <p className="text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Other Tools
              </p>
            </div>
            {COMPARISON.map((row, i) => (
              <motion.div key={row.feature}
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="grid grid-cols-3 p-4 px-6 items-center"
                style={{ borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500 }}>{row.feature}</p>
                <div className="flex justify-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <i className="fa-solid fa-check text-xs" style={{ color: '#22c55e' }}></i>
                  </div>
                </div>
                <div className="flex justify-center">
                  {row.others === true ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                      <i className="fa-solid fa-check text-xs" style={{ color: '#22c55e' }}></i>
                    </div>
                  ) : row.others === 'partial' ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(248,212,155,0.12)', border: '1px solid rgba(248,212,155,0.25)' }}>
                      <i className="fa-solid fa-minus text-xs" style={{ color: '#F8D49B' }}></i>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <i className="fa-solid fa-xmark text-xs" style={{ color: '#ef4444' }}></i>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ══ TEAM ══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="section-eyebrow">The Team</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            Meet the <span className="gradient-text">builders</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: '0.95rem' }}>
            Two developers from Pakistan, building tools the world actually needs.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {CREATORS.map((c, i) => (
            <FadeIn key={c.name} delay={i * 0.14}>
              <div className="team-card">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'linear-gradient(135deg,' + c.color + '30,' + c.color + '10)',
                    border: '3px solid ' + c.color + '50', color: c.color,
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem' }}>
                  {c.initials}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                  {c.name}
                </h3>
                <p style={{ color: c.color, fontSize: '0.78rem', fontWeight: 700, marginBottom: 14,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{c.role}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 18 }}>{c.bio}</p>
                <div className="flex flex-wrap gap-2 justify-center mb-5">
                  {c.skills.map(sk => (
                    <span key={sk} style={{ padding: '4px 12px', borderRadius: 8, fontSize: '0.74rem',
                      fontWeight: 600, fontFamily: 'var(--font-mono)',
                      background: c.color + '12', color: c.color, border: '1px solid ' + c.color + '25' }}>
                      {sk}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3">
                  {Object.entries(c.links).map(([pl, href]) => (
                    <a key={pl} href={href} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.color = c.color }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                      <i className={'fa-brands fa-' + pl + ' text-sm'}></i>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ TIMELINE ══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="section-eyebrow">Our Story</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            Dec 2025 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>→</span> <span className="gradient-text">Mar 2026</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 10, fontSize: '0.9rem' }}>From a frustrated idea to a live product in 3 months.</p>
        </FadeIn>
        <div className="relative">
          <div style={{ position: 'absolute', left: 23, top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(to bottom, var(--primary), var(--accent), transparent)',
            opacity: 0.2, borderRadius: 2 }} />
          <div className="flex flex-col gap-6">
            {TIMELINE.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="flex gap-5 items-start pl-2">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 text-base"
                    style={{ background: item.color + '20', border: '2px solid ' + item.color + '50', color: item.color }}>
                    <i className={item.icon}></i>
                  </div>
                  <div className="card p-5 flex-1" style={{ borderRadius: 'var(--radius-xl)' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.7rem',
                      color: item.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
                      {item.date}
                    </p>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                      {item.title}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.68 }}>{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TECH STACK ════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="section-eyebrow">Technology</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            Built with the <span className="gradient-text">best of 2026</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 10, fontSize: '0.9rem' }}>
            Every library chosen for performance, reliability, and zero cost.
          </p>
        </FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {TECH.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.04}>
              <motion.div whileHover={{ y: -3, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="card p-5 flex flex-col items-center text-center gap-3"
                style={{ borderRadius: 'var(--radius-lg)' }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background: t.color + '15', border: '1px solid ' + t.color + '25', color: t.color }}>
                  <i className={t.icon}></i>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text)' }}>{t.name}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ REVIEWS ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="section-eyebrow">Loved by Users</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            What people <span className="gradient-text">are saying</span>
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <FadeIn key={r.name} delay={i * 0.07}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="card p-6 h-full flex flex-col" style={{ borderRadius: 'var(--radius-xl)' }}>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <i key={j} className="fa-solid fa-star text-xs" style={{ color: '#F8D49B' }}></i>
                  ))}
                </div>
                <p style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.72, flex: 1, marginBottom: 20, fontStyle: 'italic' }}>
                  "{r.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: r.color + '20', border: '2px solid ' + r.color + '40',
                      color: r.color, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8rem' }}>
                    {r.avatar}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{r.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.role}</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ GITHUB OPEN SOURCE BANNER ══════════════════════════════════════════ */}
      <section className="py-8 px-6 max-w-5xl mx-auto">
        <FadeIn>
          <div className="card p-8 flex flex-col sm:flex-row items-center gap-6"
            style={{ borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg,rgba(117,189,224,0.06),rgba(163,185,248,0.06))' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(117,189,224,0.12)', border: '1px solid rgba(117,189,224,0.25)', color: '#75BDE0' }}>
              <i className="fa-brands fa-github"></i>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text)', marginBottom: 6 }}>
                Open Source & Community Driven
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                Transformix is open source. Found a bug? Have a feature idea? Pull requests and issues are always welcome.
              </p>
            </div>
            <a href="https://github.com/YOUR_USERNAME/transformix" target="_blank" rel="noopener noreferrer"
              className="btn-outline flex-shrink-0" style={{ whiteSpace: 'nowrap' }}>
              <i className="fa-brands fa-github"></i> View on GitHub
            </a>
          </div>
        </FadeIn>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <FadeIn className="text-center mb-10">
          <p className="section-eyebrow">FAQ</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text)' }}>
            Common <span className="gradient-text">questions</span>
          </h2>
        </FadeIn>
        <div className="flex flex-col gap-3">
          {FAQS.map(item => <FAQItem key={item.q} item={item} />)}
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 pb-28">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl" style={{
            background: 'linear-gradient(135deg,rgba(var(--primary-rgb),0.10),rgba(var(--accent-rgb),0.07))',
            border: '1.5px solid rgba(var(--primary-rgb),0.2)' }}>
            <p className="section-eyebrow mb-3">Ready to get started?</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', marginBottom: 14 }}>
              Transform your files <span className="gradient-text">today.</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.7, fontSize: '0.95rem' }}>
              25 free credits, no account needed. 7 powerful tools, zero uploads, total privacy.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/" className="btn-primary" style={{ fontSize: '1rem', padding: '13px 30px' }}>
                <i className="fa-solid fa-rocket"></i> Get Started Free
              </Link>
              <Link to="/convert" className="btn-outline" style={{ fontSize: '1rem', padding: '12px 24px' }}>
                <i className="fa-solid fa-shuffle"></i> Try File Converter
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

    </div>
  )
}
