import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import { useCredit } from '../context/CreditContext'
import CreditGuard from '../components/CreditGuard'

// ── Conversion map: input mime → list of output formats
const CONVERSIONS = {
  'image/jpeg':    { label: 'JPG Image',        outputs: ['png','webp','gif','bmp','avif'], icon: 'fa-solid fa-image', color: '#75BDE0' },
  'image/png':     { label: 'PNG Image',        outputs: ['jpg','webp','gif','bmp','avif'], icon: 'fa-solid fa-file-image', color: '#F8D49B' },
  'image/webp':    { label: 'WebP Image',       outputs: ['jpg','png','gif'], icon: 'fa-solid fa-image', color: '#F89B9B' },
  'image/gif':     { label: 'GIF Image',        outputs: ['jpg','png','webp'], icon: 'fa-solid fa-film', color: '#a855f7' },
  'image/svg+xml': { label: 'SVG Vector',       outputs: ['png','jpg'], icon: 'fa-brands fa-sketch', color: '#22c55e' },
  'image/bmp':     { label: 'BMP Image',        outputs: ['jpg','png','webp'], icon: 'fa-solid fa-image', color: '#75BDE0' },
  'text/plain':    { label: 'Text File',        outputs: ['md','html','json'], icon: 'fa-solid fa-file-lines', color: '#F8D49B' },
  'application/json': { label: 'JSON File',    outputs: ['txt','csv'], icon: 'fa-solid fa-brackets-curly', color: '#22c55e' },
  'text/csv':      { label: 'CSV File',         outputs: ['json','txt'], icon: 'fa-solid fa-file-csv', color: '#22c55e' },
  'text/html':     { label: 'HTML File',        outputs: ['txt','md'], icon: 'fa-solid fa-file-code', color: '#f97316' },
  'text/markdown': { label: 'Markdown File',    outputs: ['html','txt'], icon: 'fa-solid fa-file-lines', color: '#a855f7' },
}

function getMime(file) {
  // Fallback by extension
  const ext = file.name.split('.').pop().toLowerCase()
  const extMap = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
    bmp: 'image/bmp', txt: 'text/plain', json: 'application/json',
    csv: 'text/csv', html: 'text/html', md: 'text/markdown',
  }
  return file.type || extMap[ext] || null
}

async function convertImage(file, targetFormat) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')

        if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        ctx.drawImage(img, 0, 0)

        const mimeOut = {
          png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
          webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp',
          avif: 'image/avif',
        }
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Conversion failed'))
        }, mimeOut[targetFormat] || 'image/png', 0.92)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function convertText(file, targetFormat) {
  const text = await file.text()
  let output = text

  if (targetFormat === 'json') {
    // CSV to JSON
    const lines = text.split('\n').filter(Boolean)
    const headers = lines[0].split(',').map(h => h.trim())
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim())
      return Object.fromEntries(headers.map((h, i) => [h, vals[i]]))
    })
    output = JSON.stringify(rows, null, 2)
  } else if (targetFormat === 'csv') {
    // JSON to CSV
    try {
      const data = JSON.parse(text)
      if (Array.isArray(data) && data.length) {
        const headers = Object.keys(data[0])
        const rows = data.map(row => headers.map(h => row[h] ?? '').join(','))
        output = [headers.join(','), ...rows].join('\n')
      }
    } catch { /* keep as-is */ }
  } else if (targetFormat === 'html') {
    output = `<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><title>Converted</title></head>\n<body>\n<pre>${text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>\n</body>\n</html>`
  } else if (targetFormat === 'md') {
    output = text // txt→md: passthrough
  } else if (targetFormat === 'txt') {
    // html→txt: strip tags
    output = text.replace(/<[^>]+>/g, '').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
  }

  const mimeMap = { json: 'application/json', csv: 'text/csv', html: 'text/html', md: 'text/markdown', txt: 'text/plain' }
  return new Blob([output], { type: mimeMap[targetFormat] || 'text/plain' })
}

function ConvertCard({ file, onRemove }) {
  const { useCredit: consumeCredit } = useCredit()
  const mime = getMime(file)
  const info = mime ? CONVERSIONS[mime] : null
  const [target, setTarget] = useState(info?.outputs[0] || '')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const convert = async () => {
    if (!info || !target) return
    const ok = await consumeCredit()
    if (!ok) return toast.error('No credits remaining')

    setLoading(true)
    try {
      let blob
      if (mime?.startsWith('image/')) {
        blob = await convertImage(file, target)
      } else {
        blob = await convertText(file, target)
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const baseName = file.name.replace(/\.[^.]+$/, '')
      a.download = `${baseName}.${target}`
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
      toast.success(`Converted to .${target.toUpperCase()}!`)
    } catch (e) {
      toast.error('Conversion failed: ' + e.message)
    }
    setLoading(false)
  }

  if (!info) {
    return (
      <div className="card p-4 flex items-center gap-3" style={{ borderRadius: 'var(--radius)' }}>
        <i className="fa-solid fa-file-circle-question text-xl" style={{ color: 'var(--text-muted)' }}></i>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>{file.name}</p>
          <p style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>Unsupported format</p>
        </div>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="card p-4"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${info.color}18`, color: info.color }}
        >
          <i className={info.icon}></i>
        </div>

        {/* File info */}
        <div style={{ flex: 1, minWidth: 120 }}>
          <p style={{ color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, wordBreak: 'break-all' }}>{file.name}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {info.label} · {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>

        {/* Arrow */}
        <i className="fa-solid fa-arrow-right text-sm" style={{ color: 'var(--text-muted)' }}></i>

        {/* Target format select */}
        <div className="relative">
          <select
            className="select-field"
            style={{ width: 'auto', minWidth: 110, paddingRight: 32 }}
            value={target}
            onChange={e => setTarget(e.target.value)}
          >
            {info.outputs.map(o => (
              <option key={o} value={o}>.{o.toUpperCase()}</option>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
            style={{ color: 'var(--text-muted)' }}></i>
        </div>

        {/* Convert btn */}
        <button
          className={done ? 'btn-outline' : 'btn-primary'}
          style={{ padding: '8px 18px', fontSize: '0.85rem', flexShrink: 0 }}
          onClick={convert}
          disabled={loading}
        >
          {loading
            ? <><i className="fa-solid fa-spinner fa-spin"></i> Converting</>
            : done
              ? <><i className="fa-solid fa-check"></i> Done</>
              : <><i className="fa-solid fa-download"></i> Convert</>
          }
        </button>

        {/* Remove */}
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </motion.div>
  )
}

function FileConverterContent() {
  const [files, setFiles] = useState([])

  const onDrop = useCallback((accepted) => {
    setFiles(prev => {
      const newFiles = accepted.filter(f => !prev.find(p => p.name === f.name && p.size === f.size))
      return [...prev, ...newFiles].slice(0, 20)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50_000_000,
    multiple: true,
  })

  return (
    <div className="max-w-3xl mx-auto px-6 pb-16">
      <div className="tool-header">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(117,189,224,0.12)', border: '1px solid rgba(117,189,224,0.25)', color: '#75BDE0' }}>
            <i className="fa-solid fa-shuffle"></i>
          </div>
        </div>
        <h1>File Converter</h1>
        <p>Convert images and text files to 50+ formats. Each conversion costs 1 credit.</p>
      </div>

      {/* Supported formats info */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {['JPG', 'PNG', 'WebP', 'GIF', 'SVG', 'BMP', 'AVIF', 'JSON', 'CSV', 'TXT', 'HTML', 'MD'].map(f => (
          <span key={f} className="fmt-badge">{f}</span>
        ))}
      </div>

      {/* Dropzone */}
      <div {...getRootProps()} className={`dropzone py-10 text-center mb-6 ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <i className="fa-solid fa-cloud-arrow-up text-4xl mb-4" style={{ color: 'var(--primary)', display: 'block' }}></i>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem', marginBottom: 6 }}>
          {isDragActive ? 'Drop files here...' : 'Drag & drop files to convert'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Supports images, JSON, CSV, TXT, HTML, Markdown · Max 50MB each
        </p>
      </div>

      {/* File list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {files.map((file, i) => (
            <ConvertCard
              key={`${file.name}-${file.size}-${i}`}
              file={file}
              onRemove={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
            />
          ))}
        </AnimatePresence>
      </div>

      {files.length === 0 && (
        <p className="text-center mt-8" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Drop files above to start converting
        </p>
      )}
    </div>
  )
}

export default function FileConverter() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <CreditGuard>
        <FileConverterContent />
      </CreditGuard>
    </div>
  )
}
