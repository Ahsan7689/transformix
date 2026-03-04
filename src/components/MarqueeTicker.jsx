import React from 'react'

const ITEMS = [
  { icon: 'fa-solid fa-file-pdf', label: 'PDF', color: '#ef4444' },
  { icon: 'fa-solid fa-file-image', label: 'PNG', color: '#75BDE0' },
  { icon: 'fa-solid fa-image', label: 'JPG', color: '#F8D49B' },
  { icon: 'fa-brands fa-sketch', label: 'SVG', color: '#22c55e' },
  { icon: 'fa-solid fa-film', label: 'GIF', color: '#a855f7' },
  { icon: 'fa-solid fa-file-word', label: 'DOCX', color: '#3b82f6' },
  { icon: 'fa-solid fa-link', label: 'URL', color: '#75BDE0' },
  { icon: 'fa-solid fa-brackets-curly', label: 'JSON', color: '#F8D49B' },
  { icon: 'fa-solid fa-file-csv', label: 'CSV', color: '#22c55e' },
  { icon: 'fa-solid fa-music', label: 'MP3', color: '#F89B9B' },
  { icon: 'fa-solid fa-video', label: 'MP4', color: '#75BDE0' },
  { icon: 'fa-solid fa-file-zipper', label: 'ZIP', color: '#a855f7' },
  { icon: 'fa-solid fa-image', label: 'WebP', color: '#F8D49B' },
  { icon: 'fa-solid fa-shield-halved', label: 'META', color: '#a855f7' },
  { icon: 'fa-solid fa-wand-magic-sparkles', label: 'AI GEN', color: '#F89B9B' },
  { icon: 'fa-solid fa-file-code', label: 'HTML', color: '#f97316' },
  { icon: 'fa-solid fa-file-lines', label: 'TXT', color: '#8a857d' },
  { icon: 'fa-solid fa-qrcode', label: 'QR', color: '#75BDE0' },
]

const DUPED = [...ITEMS, ...ITEMS]

export default function MarqueeTicker() {
  return (
    React.createElement('div', {
      style: {
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        overflow: 'hidden',
        padding: '14px 0',
        position: 'relative',
      }
    },
      React.createElement('div', {
        style: {
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(to right, var(--surface), transparent)', pointerEvents: 'none',
        }
      }),
      React.createElement('div', {
        style: {
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(to left, var(--surface), transparent)', pointerEvents: 'none',
        }
      }),
      React.createElement('div', { className: 'marquee-track' },
        DUPED.map((item, i) =>
          React.createElement('div', {
            key: i,
            style: {
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px',
              flexShrink: 0, color: 'var(--text-muted)', fontSize: '0.88rem',
              fontWeight: 600, fontFamily: 'var(--font-mono)',
            }
          },
            React.createElement('i', { className: item.icon + ' text-sm', style: { color: item.color } }),
            React.createElement('span', null, item.label),
            React.createElement('span', { style: { marginLeft: 12, opacity: 0.2 } }, '·')
          )
        )
      )
    )
  )
}
