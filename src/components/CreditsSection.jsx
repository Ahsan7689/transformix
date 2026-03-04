import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { useCredit } from '../context/CreditContext'

const TIERS = [
  {
    label: 'Guest',
    icon: 'fa-solid fa-user',
    credits: 25,
    reset: 10,
    resetHours: 28,
    color: '#75BDE0',
    features: [
      '25 starting credits',
      '+10 every 28 hours',
      'IP-tracked per device',
      'All tools available',
      'No sign-up required',
    ],
    cta: 'Start Free',
  },
  {
    label: 'Signed In',
    icon: 'fa-solid fa-circle-check',
    credits: 100,
    reset: 50,
    resetHours: 24,
    color: '#F89B9B',
    highlight: true,
    features: [
      '100 starting credits',
      '+50 every 24 hours',
      'Synced across devices',
      'Usage history',
      'Profile settings',
      'Priority processing',
    ],
    cta: 'Sign Up Free',
  },
]

export default function CreditsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { credits, user } = useCredit()

  return (
    <section ref={ref} className="py-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.p
          className="section-eyebrow"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        >
          Credit System
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontFamily: 'var(--font-display)' }}
        >
          Always free.{' '}
          <span className="gradient-text">More with an account.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          style={{ color: 'var(--text-muted)', maxWidth: 460, margin: '1rem auto 0', lineHeight: 1.65 }}
        >
          Each tool use costs 1 credit. Credits reset automatically — no subscription needed.
        </motion.p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.label}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 + i * 0.12 }}
          >
            <div
              className="card h-full p-7 flex flex-col gap-5 relative overflow-hidden"
              style={{
                borderRadius: 'var(--radius-xl)',
                ...(tier.highlight ? {
                  border: `1.5px solid ${tier.color}50`,
                  boxShadow: `0 8px 48px ${tier.color}20`,
                } : {}),
              }}
            >
              {tier.highlight && (
                <div
                  className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${tier.color}20`, color: tier.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
                >
                  RECOMMENDED
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: `${tier.color}18`, color: tier.color, border: `1px solid ${tier.color}30` }}
                >
                  <i className={tier.icon}></i>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                    {tier.label}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Free forever
                  </p>
                </div>
              </div>

              {/* Credit display */}
              <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ background: `${tier.color}0c`, border: `1px solid ${tier.color}20` }}
              >
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '2rem', color: tier.color, lineHeight: 1 }}>
                    {tier.credits}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                    Starting credits
                  </p>
                </div>
                <div className="text-right">
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--accent)', lineHeight: 1 }}>
                    +{tier.reset}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                    Every {tier.resetHours}h
                  </p>
                </div>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-2)' }}>
                    <i className="fa-solid fa-circle-check text-xs" style={{ color: tier.color }}></i>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Current indicator */}
              {((tier.label === 'Guest' && !user) || (tier.label === 'Signed In' && user)) && (
                <div
                  className="mt-auto px-4 py-2.5 rounded-xl text-center text-sm font-semibold"
                  style={{
                    background: `${tier.color}18`,
                    color: tier.color,
                    border: `1px solid ${tier.color}30`,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <i className="fa-solid fa-circle-dot mr-2"></i>
                  Your current plan · {credits} credits remaining
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* How credits work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.45 }}
        className="mt-12 p-6 rounded-3xl text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', maxWidth: 600, margin: '3rem auto 0' }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 8 }}>
          <i className="fa-solid fa-bolt mr-2" style={{ color: 'var(--accent)' }}></i>
          How credits work
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>
          Every tool operation costs <strong style={{ color: 'var(--text)' }}>1 credit</strong>. Credits auto-reset on a rolling timer — no manual action needed. Same IP, any browser, same credit pool.
        </p>
      </motion.div>
    </section>
  )
}
