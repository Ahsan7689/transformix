import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression'
import { useCredit } from '../context/CreditContext'
import CreditGuard from '../components/CreditGuard'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function FileCard({ file, onRemove }) {
  const [status, setStatus]       = useState('idle') // idle | compressing | done | error
  const [result, setResult]       = useState(null)
  const [quality, setQuality]     = useState(80)
  const [maxWidth, setMaxWidth]   = useState(1920)
  const previewUrl                = URL.createObjectURL(file)

  const compress = async () => {
    setStatus('compressing')
    try {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        initialQuality: quality / 100,
        fileType: file.type,
      }
      const compressed = await imageCompression(file, options)
      const url = URL.createObjectURL(compressed)
      setResult({ blob: compressed, url, size: compressed.size })
      setStatus('done')
      toast.success('Compressed successfully!')
    } catch (e) {
      setStatus('error')
      toast.error('Compression failed. Try a different image.')
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = result.url
    const ext = file.name.split('.').pop()
    a.download = file.name.replace('.' + ext, '') + '-compressed.' + ext
    a.click()
  }

  const savings = result ? Math.round((1 - result.size / file.size) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card p-5 mb-4"
      style={{ borderRadius: 'var(--radius-xl)' }}
    >
      <div className="flex items-start gap-4 flex-wrap">
        {/* Thumbnail */}
        <img src={previewUrl} alt={file.name}
          className="rounded-xl object-cover flex-shrink-0"
          style={{ width: 80, height: 80, border: '1px solid var(--border)' }} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
            {file.name}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 2 }}>
            Original: <strong style={{ color: 'var(--text)' }}>{formatBytes(file.size)}</strong>
            {result && (
              <> → Compressed: <strong style={{ color: '#22c55e' }}>{formatBytes(result.size)}</strong>
                <span style={{ marginLeft: 8, background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                  -{savings}%
                </span>
              </>
            )}
          </p>

          {/* Controls */}
          {status === 'idle' && (
            <div className="mt-3 flex flex-wrap gap-4 items-end">
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Quality: <strong style={{ color: 'var(--text)' }}>{quality}%</strong>
                </label>
                <input type="range" min="10" max="100" value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                  style={{ width: 120, accentColor: 'var(--primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Max width: <strong style={{ color: 'var(--text)' }}>{maxWidth}px</strong>
                </label>
                <select value={maxWidth} onChange={e => setMaxWidth(Number(e.target.value))}
                  className="input-field" style={{ padding: '4px 10px', fontSize: '0.8rem', width: 'auto' }}>
                  <option value={3840}>4K (3840px)</option>
                  <option value={1920}>Full HD (1920px)</option>
                  <option value={1280}>HD (1280px)</option>
                  <option value={800}>Web (800px)</option>
                  <option value={400}>Thumbnail (400px)</option>
                </select>
              </div>
              <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={compress}>
                <i className="fa-solid fa-compress"></i> Compress
              </button>
            </div>
          )}

          {status === 'compressing' && (
            <div className="flex items-center gap-2 mt-3">
              <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--primary)' }}></i>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Compressing...</span>
            </div>
          )}

          {status === 'done' && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={download}>
                <i className="fa-solid fa-download"></i> Download
              </button>
              <button onClick={() => { setStatus('idle'); setResult(null) }}
                style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: 10, cursor: 'pointer',
                  background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-rotate-right"></i> Re-compress
              </button>
            </div>
          )}

          {status === 'error' && (
            <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginTop: 8 }}>
              <i className="fa-solid fa-triangle-exclamation mr-1"></i> Compression failed. Try again.
            </p>
          )}
        </div>

        {/* Remove */}
        <button onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: 4 }}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </motion.div>
  )
}

function Content() {
  const { useCredit: consume } = useCredit()
  const [files, setFiles] = useState([])

  const onDrop = useCallback(async (accepted) => {
    const imgs = accepted.filter(f => f.type.startsWith('image/'))
    if (!imgs.length) return toast.error('Please upload image files (JPG, PNG, WebP)')
    const ok = await consume()
    if (!ok) return toast.error('No credits remaining')
    setFiles(prev => [...prev, ...imgs.map(f => ({ file: f, id: f.name + Date.now() }))])
  }, [consume])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'] }, multiple: true
  })

  return (
    <div className="max-w-3xl mx-auto px-6 pb-16">
      <div className="tool-header">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(155,248,208,0.12)', border: '1px solid rgba(155,248,208,0.25)', color: '#9BF8D0' }}>
            <i className="fa-solid fa-compress-arrows-alt"></i>
          </div>
        </div>
        <h1>Image Compressor</h1>
        <p>Compress JPG, PNG, WebP images instantly in your browser. <strong>No uploads</strong>, no server, 100% private.</p>
      </div>

      {/* Stats bar */}
      <div className="flex justify-center gap-6 mb-8 flex-wrap">
        {[
          { icon: 'fa-lock', label: '100% Private', sub: 'Never leaves your device' },
          { icon: 'fa-bolt', label: 'Instant', sub: 'Browser-side processing' },
          { icon: 'fa-images', label: 'Batch Support', sub: 'Multiple files at once' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2" style={{ fontSize: '0.82rem' }}>
            <i className={s.icon + ' fa-solid'} style={{ color: '#9BF8D0' }}></i>
            <div>
              <p style={{ color: 'var(--text)', fontWeight: 600 }}>{s.label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div {...getRootProps()} className="dropzone mb-6" style={{
        border: '2px dashed ' + (isDragActive ? 'var(--primary)' : 'var(--border)'),
        borderRadius: 'var(--radius-xl)', padding: '2.5rem', textAlign: 'center', cursor: 'pointer',
        background: isDragActive ? 'rgba(var(--primary-rgb),0.04)' : 'var(--surface)', transition: 'all 0.2s',
      }}>
        <input {...getInputProps()} />
        <i className="fa-solid fa-cloud-arrow-up text-3xl mb-3" style={{ color: '#9BF8D0', display: 'block' }}></i>
        <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>
          {isDragActive ? 'Drop images here...' : 'Drop images here or click to browse'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Supports JPG, PNG, WebP, GIF, BMP · Multiple files OK
        </p>
      </div>

      {/* File cards */}
      <AnimatePresence>
        {files.map(({ file, id }) => (
          <FileCard key={id} file={file} onRemove={() => setFiles(prev => prev.filter(f => f.id !== id))} />
        ))}
      </AnimatePresence>

      {files.length > 1 && (
        <button onClick={() => setFiles([])}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.85rem', display: 'block', margin: '0 auto' }}>
          <i className="fa-solid fa-trash mr-1"></i> Clear all
        </button>
      )}
    </div>
  )
}

export default function ImageCompressor() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <CreditGuard><Content /></CreditGuard>
    </div>
  )
}
