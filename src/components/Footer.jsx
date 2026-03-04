import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

const LINKS = {
  Tools: [
    { to: '/convert', label: 'File Converter' },
    { to: '/img-to-pdf', label: 'Image to PDF' },
    { to: '/shorten', label: 'Link Shortener' },
    { to: '/metadata', label: 'Metadata Remover' },
    { to: '/compress', label: 'Image Compressor' },
    { to: '/qr',       label: 'QR Code Generator' },
    { to: '/palette',  label: 'Color Palette Generator' },
  ],
  Company: [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/profile', label: 'Profile' },
  ],
}

export default function Footer() {
  return (
    <footer className="mt-20 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 no-underline mb-4" style={{ textDecoration: 'none' }}>
              <img
                src="https://rzhnxywqmlbvldmqmmsi.supabase.co/storage/v1/object/public/Content/Untitled%20design.png"
                alt="Transformix"
                style={{ display: 'block', objectFit: 'contain', maxHeight: 36 }}
              />
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65, maxWidth: 260 }}>
              The all-in-one file toolkit. Convert, compress, generate, and protect — all for free.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: 'fa-brands fa-github', href: '#' },
                { icon: 'fa-brands fa-twitter', href: '#' },
                { icon: 'fa-brands fa-linkedin', href: '#' },
              ].map(s => (
                <a
                  key={s.icon}
                  href={s.href}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <i className={`${s.icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 14 }}>
                {section}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            © {new Date().getFullYear()} Transformix. Made with <i className="fa-solid fa-heart text-xs" style={{ color: 'var(--primary)' }}></i>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <i className="fa-solid fa-bolt mr-1.5" style={{ color: 'var(--accent)' }}></i>
            Powered by Gemini AI · Built with React + Vite
          </p>
        </div>
      </div>
    </footer>
  )
}