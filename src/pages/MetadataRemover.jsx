import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import { useCredit } from '../context/CreditContext'
import CreditGuard from '../components/CreditGuard'

// ── Metadata extraction utilities ──
function extractImageMetadata(buffer) {
  const view = new DataView(buffer)
  const metadata = {}

  // Check JPEG
  if (view.getUint16(0) === 0xFFD8) {
    metadata.format = 'JPEG'
    let offset = 2
    while (offset < buffer.byteLength) {
      if (view.getUint8(offset) !== 0xFF) break
      const marker = view.getUint16(offset)
      const segLen = view.getUint16(offset + 2) + 2
      if (marker === 0xFFE1) {
        // EXIF segment
        try {
          const decoder = new TextDecoder()
          const bytes = new Uint8Array(buffer, offset + 4, 4)
          const header = decoder.decode(bytes)
          if (header.startsWith('Exif')) {
            metadata.hasExif = true
            metadata.exifSize = segLen + ' bytes'
          }
        } catch {}
      }
      if (marker === 0xFFD9) break
      offset += segLen
    }
  } else if (
    view.getUint8(0) === 0x89 && view.getUint8(1) === 0x50
  ) {
    metadata.format = 'PNG'
    // Check for tEXt or zTXt chunks
    let offset = 8
    while (offset < buffer.byteLength - 12) {
      const length = view.getUint32(offset)
      const type = String.fromCharCode(
        view.getUint8(offset + 4), view.getUint8(offset + 5),
        view.getUint8(offset + 6), view.getUint8(offset + 7)
      )
      if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') {
        metadata.hasTextChunks = true
        metadata.textChunkCount = (metadata.textChunkCount || 0) + 1
      }
      if (type === 'IEND') break
      offset += length + 12
    }
  }

  return metadata
}

async function removeImageMetadata(file) {
  const buffer = await file.arrayBuffer()
  const view = new DataView(buffer)

  // JPEG: strip APP1 (EXIF) and APP13 (IPTC) segments
  if (view.getUint16(0) === 0xFFD8) {
    const canvas = document.createElement('canvas')
    const img = new Image()
    const blobUrl = URL.createObjectURL(file)

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(blobUrl)
        canvas.toBlob(blob => {
          resolve(blob)
        }, 'image/jpeg', 0.95)
      }
      img.onerror = reject
      img.src = blobUrl
    })
  }

  // PNG: redraw to strip metadata
  if (view.getUint8(0) === 0x89 && view.getUint8(1) === 0x50) {
    const canvas = document.createElement('canvas')
    const img = new Image()
    const blobUrl = URL.createObjectURL(file)

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(blobUrl)
        canvas.toBlob(blob => {
          resolve(blob)
        }, 'image/png')
      }
      img.onerror = reject
      img.src = blobUrl
    })
  }

  // WebP: redraw
  const canvas = document.createElement('canvas')
  const img = new Image()
  const blobUrl = URL.createObjectURL(file)
  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d').drawImage(img, 0, 0)
      URL.revokeObjectURL(blobUrl)
      canvas.toBlob(blob => resolve(blob), 'image/webp', 0.95)
    }
    img.onerror = reject
    img.src = blobUrl
  })
}

function MetaFileRow({ file, onRemove }) {
  const { useCredit: consumeCredit } = useCredit()
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [meta, setMeta]         = useState(null)
  const [analyzed, setAnalyzed] = useState(false)

  const analyze = async () => {
    const buf = await file.arrayBuffer()
    const m = extractImageMetadata(buf)
    setMeta(m)
    setAnalyzed(true)
  }

  const remove = async () => {
    const ok = await consumeCredit()
    if (!ok) return toast.error('No credits remaining')
    setLoading(true)
    try {
      const blob = await removeImageMetadata(file)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const base = file.name.replace(/\.[^.]+$/, '')
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      a.download = `${base}-clean.${ext}`
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
      toast.success('Metadata removed & file downloaded!')
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="card"
      style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}
    >
      <div className="p-4 flex items-center gap-3 flex-wrap">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)' }}
        >
          <i className="fa-solid fa-shield-halved text-sm"></i>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, wordBreak: 'break-all' }}>{file.name}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {file.type || 'Unknown'} · {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!analyzed && (
            <button
              className="btn-outline"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              onClick={analyze}
            >
              <i className="fa-solid fa-magnifying-glass"></i> Analyze
            </button>
          )}
          <button
            className={done ? 'btn-outline' : 'btn-primary'}
            style={{ padding: '6px 16px', fontSize: '0.82rem' }}
            onClick={remove}
            disabled={loading}
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin"></i> Cleaning...</>
              : done
                ? <><i className="fa-solid fa-check"></i> Done</>
                : <><i className="fa-solid fa-eraser"></i> Remove Metadata</>
            }
          </button>
          <button
            onClick={onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      {/* Metadata info */}
      <AnimatePresence>
        {analyzed && meta && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}
          >
            <div className="px-4 py-3">
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Detected Metadata
              </p>
              <div className="flex flex-wrap gap-2">
                {meta.format && (
                  <span className="pill" style={{ fontSize: '0.75rem' }}>
                    <i className="fa-solid fa-file text-xs"></i> Format: {meta.format}
                  </span>
                )}
                {meta.hasExif && (
                  <span
                    className="pill"
                    style={{ fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}
                  >
                    <i className="fa-solid fa-triangle-exclamation text-xs"></i> EXIF data ({meta.exifSize})
                  </span>
                )}
                {meta.hasTextChunks && (
                  <span
                    className="pill"
                    style={{ fontSize: '0.75rem', color: '#f97316', borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)' }}
                  >
                    <i className="fa-solid fa-triangle-exclamation text-xs"></i> {meta.textChunkCount} text chunk{meta.textChunkCount > 1 ? 's' : ''}
                  </span>
                )}
                {!meta.hasExif && !meta.hasTextChunks && (
                  <span className="pill" style={{ fontSize: '0.75rem', color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}>
                    <i className="fa-solid fa-check text-xs"></i> No visible metadata detected
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MetadataRemoverContent() {
  const [files, setFiles] = useState([])

  const onDrop = useCallback((accepted) => {
    setFiles(prev => [...prev, ...accepted].slice(0, 20))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 30_000_000,
  })

  return (
    <div className="max-w-2xl mx-auto px-6 pb-16">
      <div className="tool-header">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7' }}>
            <i className="fa-solid fa-shield-halved"></i>
          </div>
        </div>
        <h1>Metadata Remover</h1>
        <p>Strip EXIF data, GPS coordinates, and hidden info from your images before sharing.</p>
      </div>

      {/* What it removes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: 'fa-solid fa-location-dot', label: 'GPS Location', color: '#ef4444' },
          { icon: 'fa-solid fa-camera', label: 'Camera Info', color: '#f97316' },
          { icon: 'fa-solid fa-clock', label: 'Timestamps', color: '#a855f7' },
          { icon: 'fa-solid fa-user', label: 'Author Info', color: '#3b82f6' },
        ].map(item => (
          <div key={item.label} className="card p-3 text-center" style={{ borderRadius: 'var(--radius)' }}>
            <i className={`${item.icon} text-lg mb-2`} style={{ color: item.color, display: 'block' }}></i>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</p>
          </div>
        ))}
      </div>

      <div {...getRootProps()} className={`dropzone py-10 text-center mb-6 ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <i className="fa-solid fa-cloud-arrow-up text-4xl mb-4" style={{ color: 'var(--primary)', display: 'block' }}></i>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem', marginBottom: 6 }}>
          {isDragActive ? 'Drop images here...' : 'Drop images to clean'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          JPEG, PNG, WebP · Up to 30MB each
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {files.map((file, i) => (
            <MetaFileRow
              key={`${file.name}-${file.size}-${i}`}
              file={file}
              onRemove={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function MetadataRemover() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <CreditGuard>
        <MetadataRemoverContent />
      </CreditGuard>
    </div>
  )
}
