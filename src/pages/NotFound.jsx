import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

export default function NotFound() {
  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '6rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
          404
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text)', margin: '1rem 0 0.5rem' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The page you're looking for doesn't exist or was moved.
        </p>
        <Link to="/" className="btn-primary">
          <i className="fa-solid fa-home"></i> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
