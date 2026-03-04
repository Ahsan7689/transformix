import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

const STEPS = [
  {
    step: '01',
    icon: 'fa-solid fa-cloud-arrow-up',
    title: 'Drop your file',
    desc: 'Drag and drop any file into the tool. No size limit for most conversions.',
    color: '#75BDE0',
  },
  {
    step: '02',
    icon: 'fa-solid fa-sliders',
    title: 'Choose options',
    desc: 'Pick output format, quality settings, or enter your prompt. Fully customizable.',
    color: '#F8D49B',
  },
  {
    step: '03',
    icon: 'fa-solid fa-bolt',
    title: 'Process instantly',
    desc: 'Everything runs in your browser — fast, private, zero server uploads.',
    color: '#F89B9B',
  },
  {
    step: '04',
    icon: 'fa-solid fa-download',
    title: 'Download result',
    desc: 'Your converted file downloads instantly. Done. No emails, no waiting.',
    color: '#a855f7',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <motion.p
          className="section-eyebrow"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        >
          How it works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'var(--font-display)' }}
        >
          Done in <span className="gradient-text">4 simple steps.</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1], duration: 0.55 }}
          >
            <div
              className="card p-6 h-full flex flex-col gap-4 relative overflow-hidden"
              style={{ borderRadius: 'var(--radius-xl)' }}
            >
              {/* Step number watermark */}
              <span style={{
                position: 'absolute', top: -10, right: 10,
                fontFamily: 'var(--font-mono)', fontWeight: 900,
                fontSize: '5rem', color: 'var(--border)', lineHeight: 1,
                pointerEvents: 'none', userSelect: 'none',
              }}>
                {step.step}
              </span>

              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{
                  background: step.color + '18',
                  border: '1px solid ' + step.color + '30',
                  color: step.color,
                }}
              >
                <i className={step.icon}></i>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text)' }}>
                {step.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
