import { useRef } from 'react'
import { useState } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'

const CREATORS = [
  {
    name: 'Muhammad Ahsan',
    initials: 'MA',
    role: 'Full-Stack Developer & Co-Founder',
    color: '#75BDE0',
    bio: 'Passionate full-stack developer building high-performance web apps. Expert in React, Node.js, backend architecture, animations, and scalable systems.',
    skills: ['React', 'Node.js', 'Supabase', 'GSAP', 'System Design', 'Vite'],
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
  {
    name: 'Syeda Nimra',
    initials: 'SN',
    role: 'Frontend Developer & Co-Founder',
    color: '#F89B9B',
    bio: 'Frontend developer specializing in beautiful, responsive web interfaces. Expert in React, modern CSS, and crafting smooth user experiences that feel great on every device.',
    skills: ['React', 'Frontend Dev', 'Tailwind CSS', 'Responsive Design', 'Component Systems', 'Web Performance'],
    links: { github: '#', linkedin: '#', twitter: '#' },
  },
]

const TIMELINE = [
  {
    date: 'December 2025',
    icon: 'fa-solid fa-lightbulb',
    title: 'The Idea is Born',
    desc: 'Frustrated with jumping between 10+ websites just to convert a file or shorten a link, Muhammad Ahsan and Syeda Nimra decided to build one free, unified toolkit.',
    color: '#75BDE0',
  },
  {
    date: 'January 2026',
    icon: 'fa-solid fa-code',
    title: 'Development Begins',
    desc: 'Built with React + Vite + Supabase. The first two tools, File Converter and Image to PDF, were completed and polished in the first two weeks.',
    color: '#F8D49B',
  },
  {
    date: 'February 2026',
    icon: 'fa-solid fa-robot',
    title: 'AI Powers Up',
    desc: 'Integrated Google Gemini 2.0 Flash image generation and Imagen 4, bringing 2026 AI directly into the free toolkit. Link shortener and metadata remover also shipped.',
    color: '#F89B9B',
  },
  {
    date: 'March 2026',
    icon: 'fa-solid fa-rocket',
    title: 'Public Launch',
    desc: 'Transformix goes live. Five fully working tools, dual theme, credit system, smooth animations, and zero sign-up required. Built in 3 months, free forever.',
    color: '#a855f7',
  },
]

const TECH = [
  { name: 'React 18',            icon: 'fa-brands fa-react',              color: '#61DAFB' },
  { name: 'Vite',                icon: 'fa-solid fa-bolt',                color: '#FFD62E' },
  { name: 'Supabase',            icon: 'fa-solid fa-database',            color: '#3ECF8E' },
  { name: 'Framer Motion',       icon: 'fa-solid fa-film',                color: '#F89B9B' },
  { name: 'GSAP',                icon: 'fa-solid fa-wand-magic-sparkles', color: '#88CE02' },
  { name: 'Lenis Scroll',        icon: 'fa-solid fa-scroll',              color: '#75BDE0' },
  { name: 'Gemini 2.0 + Img4',  icon: 'fa-solid fa-robot',              color: '#F8D49B' },
  { name: 'Tailwind CSS',        icon: 'fa-solid fa-paintbrush',          color: '#38BDF8' },
]

const STATS = [
  { value: '5+',   label: 'Powerful Tools', icon: 'fa-solid fa-toolbox',  color: '#75BDE0' },
  { value: '50+',  label: 'File Formats',   icon: 'fa-solid fa-file',     color: '#F8D49B' },
  { value: '100%', label: 'Free to Use',    icon: 'fa-solid fa-heart',    color: '#F89B9B' },
  { value: '2026', label: 'Launched',       icon: 'fa-solid fa-calendar', color: '#a855f7' },
]

const FAQS = [
  { q: 'Is Transformix really free?', a: 'Yes. 25 free credits, no account needed. Each tool use costs 1 credit, resetting every 28 hours. Sign in for 100 credits resetting every 24 hours.' },
  { q: 'Do my files stay private?', a: 'Completely. All processing runs in your browser. Files never reach any server — zero uploads, zero storage, total privacy.' },
  { q: 'What AI model powers image generation?', a: 'We use Google Gemini 2.0 Flash Experimental (free tier) as primary, with Imagen 4 (imagen-4.0-generate-001) as the high-quality fallback — both are 2026 models.' },
  { q: 'When was Transformix built?', a: 'We started in December 2025 and launched publicly in March 2026 — 3 months from idea to live product.' },
]

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function FAQItem({ item, i }) {
  const [open, setOpen] = useState(false)
  return (
    <div className='card overflow-hidden' style={{ borderRadius: 'var(--radius-lg)' }}>
      <button onClick={() => setOpen(o => !o)} className='w-full flex items-center justify-between p-5 text-left'
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', paddingRight: 16 }}>
          {item.q}
        </span>
        <motion.i className='fa-solid fa-chevron-down flex-shrink-0'
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

export default function About() {
  return (
    <div style={{ paddingTop: '80px' }}>

      {/* HERO */}
      <section className='relative py-20 px-6 overflow-hidden'>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(var(--primary-rgb),0.10), transparent)' }} />
        <div className='max-w-4xl mx-auto text-center relative z-10'>
          <FadeIn>
            <p className='section-eyebrow mb-4'>About Transformix</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1.5rem' }}>
              Built by developers,<br />
              <span className='gradient-text'>for everyone.</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 2rem' }}>
              Transformix was born in December 2025 from one simple frustration: why do you need 10 different websites
              to convert a file, shorten a link, or generate an AI image? We built one place that does it all,
              beautifully, instantly, and completely free.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12'>
              {STATS.map(s => (
                <div key={s.label} className='stat-card'>
                  <i className={s.icon + ' text-xl mb-3'} style={{ color: s.color, display: 'block' }}></i>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text)', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 6 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* MISSION */}
      <section className='py-12 px-6 max-w-5xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FadeIn>
            <div className='card h-full p-8' style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-5'
                style={{ background: 'rgba(117,189,224,0.12)', color: '#75BDE0', border: '1px solid rgba(117,189,224,0.25)' }}>
                <i className='fa-solid fa-bullseye'></i>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)', marginBottom: 12 }}>Our Mission</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Make powerful file tools accessible to everyone, completely free, zero sign-up barriers, no downloads.
                Drop your file and get the job done in seconds.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className='card h-full p-8' style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-5'
                style={{ background: 'rgba(248,212,155,0.12)', color: 'var(--accent)', border: '1px solid rgba(248,212,155,0.25)' }}>
                <i className='fa-solid fa-shield-halved'></i>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--text)', marginBottom: 12 }}>Privacy First</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                All file processing runs entirely in your browser. Your files never leave your device.
                No server uploads, no data collection, guaranteed privacy.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TEAM */}
      <section className='py-16 px-6 max-w-5xl mx-auto'>
        <FadeIn className='text-center mb-12'>
          <p className='section-eyebrow'>The Team</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            Meet the <span className='gradient-text'>builders</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: '0.95rem' }}>
            Two developers from Pakistan, building tools the world actually needs.
          </p>
        </FadeIn>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto'>
          {CREATORS.map((c, i) => (
            <FadeIn key={c.name} delay={i * 0.14}>
              <div className='team-card'>
                <div className='w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5'
                  style={{ background: 'linear-gradient(135deg, ' + c.color + '30, ' + c.color + '10)',
                    border: '3px solid ' + c.color + '40', color: c.color,
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem' }}>
                  {c.initials}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                  {c.name}
                </h3>
                <p style={{ color: c.color, fontSize: '0.82rem', fontWeight: 700, marginBottom: 14, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                  {c.role}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 18 }}>
                  {c.bio}
                </p>
                <div className='flex flex-wrap gap-2 justify-center mb-5'>
                  {c.skills.map(sk => (
                    <span key={sk} style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 8,
                      fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
                      background: c.color + '12', color: c.color, border: '1px solid ' + c.color + '25' }}>
                      {sk}
                    </span>
                  ))}
                </div>
                <div className='flex items-center justify-center gap-3'>
                  {Object.entries(c.links).map(([pl, href]) => (
                    <a key={pl} href={href} target='_blank' rel='noopener noreferrer'
                      className='w-9 h-9 rounded-xl flex items-center justify-center transition-all'
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

      {/* TIMELINE */}
      <section className='py-16 px-6 max-w-3xl mx-auto'>
        <FadeIn className='text-center mb-12'>
          <p className='section-eyebrow'>Our Story</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            Dec 2025 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>to</span> <span className='gradient-text'>Mar 2026</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 10, fontSize: '0.9rem' }}>
            From a frustrated idea to a live product in 3 months.
          </p>
        </FadeIn>
        <div className='flex flex-col gap-4'>
          {TIMELINE.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.1}>
              <div className='card p-6 flex gap-5 items-start' style={{ borderRadius: 'var(--radius-xl)' }}>
                <div className='w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg'
                  style={{ background: item.color + '18', border: '1px solid ' + item.color + '30', color: item.color }}>
                  <i className={item.icon}></i>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.72rem',
                    color: item.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
                    {item.date}
                  </p>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text)', marginBottom: 6 }}>
                    {item.title}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.68 }}>{item.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className='py-12 px-6 max-w-5xl mx-auto'>
        <FadeIn className='text-center mb-10'>
          <p className='section-eyebrow'>Technology</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--text)' }}>
            Built with the <span className='gradient-text'>best of 2026</span>
          </h2>
        </FadeIn>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          {TECH.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.05}>
              <div className='card p-5 flex flex-col items-center text-center gap-3' style={{ borderRadius: 'var(--radius-lg)' }}>
                <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-xl'
                  style={{ background: t.color + '15', border: '1px solid ' + t.color + '25', color: t.color }}>
                  <i className={t.icon}></i>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{t.name}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className='py-12 px-6 max-w-3xl mx-auto'>
        <FadeIn className='text-center mb-10'>
          <p className='section-eyebrow'>FAQ</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text)' }}>
            Common <span className='gradient-text'>questions</span>
          </h2>
        </FadeIn>
        <div className='flex flex-col gap-3'>
          {FAQS.map((item, i) => <FAQItem key={item.q} item={item} i={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section className='py-16 px-6 pb-24'>
        <FadeIn>
          <div className='max-w-2xl mx-auto text-center p-10 rounded-3xl' style={{
            background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.10), rgba(var(--accent-rgb),0.07))',
            border: '1.5px solid rgba(var(--primary-rgb),0.2)' }}>
            <p className='section-eyebrow mb-3'>Ready to get started?</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', marginBottom: 12 }}>
              Transform your files <span className='gradient-text'>today.</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 26, lineHeight: 1.65 }}>
              25 free credits, no account needed. Convert, compress, generate and protect your files in seconds.
            </p>
            <div className='flex flex-wrap gap-3 justify-center'>
              <Link to='/' className='btn-primary' style={{ fontSize: '1rem', padding: '13px 30px' }}>
                <i className='fa-solid fa-rocket'></i> Get Started Free
              </Link>
              <Link to='/convert' className='btn-outline' style={{ fontSize: '1rem' }}>
                <i className='fa-solid fa-shuffle'></i> Try File Converter
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

    </div>
  )
}