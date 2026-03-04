import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'motion/react'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import { useCredit } from '../context/CreditContext'
import CreditGuard from '../components/CreditGuard'

function FileThumb({ file, index, onRemove, onMoveUp, onMoveDown, total }) {
  const url = URL.createObjectURL(file)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', aspectRatio: '3/4' }}
    >
      <img src={url} alt={file.name} className="w-full h-full object-cover" />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      >
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              onClick={() => onMoveUp(index)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <i className="fa-solid fa-arrow-up text-xs"></i>
            </button>
          )}
          {index < total - 1 && (
            <button
              onClick={() => onMoveDown(index)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <i className="fa-solid fa-arrow-down text-xs"></i>
            </button>
          )}
        </div>
        <button
          onClick={() => onRemove(index)}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.8)', color: 'white' }}
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
      <div
        className="absolute bottom-2 left-2 text-xs font-bold px-2 py-0.5 rounded-md"
        style={{ background: 'rgba(0,0,0,0.6)', color: 'white', fontFamily: 'var(--font-mono)' }}
      >
        {index + 1}
      </div>
    </motion.div>
  )
}

function ImageToPDFContent() {
  const { useCredit: consumeCredit } = useCredit()
  const [files, setFiles] = useState([])
  const [pageSize, setPageSize] = useState('a4')
  const [orientation, setOrientation] = useState('portrait')
  const [quality, setQuality] = useState('high')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((accepted) => {
    setFiles(prev => [...prev, ...accepted].slice(0, 50))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'] },
    maxSize: 20_000_000,
  })

  const moveUp = (i) => {
    const arr = [...files]
    ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
    setFiles(arr)
  }

  const moveDown = (i) => {
    const arr = [...files]
    ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
    setFiles(arr)
  }

  const remove = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const qualityMap = { low: 0.5, medium: 0.75, high: 0.92 }

  const convertToPDF = async () => {
    if (files.length === 0) return toast.error('Add at least one image')
    const ok = await consumeCredit()
    if (!ok) return toast.error('No credits remaining')

    setLoading(true)
    setProgress(0)

    try {
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize,
      })

      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round(((i + 1) / files.length) * 100))
        if (i > 0) pdf.addPage(pageSize, orientation)

        await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
              const ratio = Math.min(pageW / img.width, pageH / img.height)
              const w = img.width * ratio
              const h = img.height * ratio
              const x = (pageW - w) / 2
              const y = (pageH - h) / 2
              const format = files[i].type === 'image/png' ? 'PNG' : 'JPEG'
              pdf.addImage(e.target.result, format, x, y, w, h, undefined, 'FAST')
              resolve()
            }
            img.onerror = reject
            img.src = e.target.result
          }
          reader.onerror = reject
          reader.readAsDataURL(files[i])
        })
      }

      pdf.save(`transformix-${Date.now()}.pdf`)
      toast.success(`PDF created with ${files.length} page${files.length > 1 ? 's' : ''}! 🎉`)
      setProgress(100)
    } catch (e) {
      toast.error('Error creating PDF: ' + e.message)
    }

    setLoading(false)
    setTimeout(() => setProgress(0), 1500)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pb-16">
      {/* Tool header */}
      <div className="tool-header">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
            <i className="fa-solid fa-file-pdf"></i>
          </div>
        </div>
        <h1>Image to PDF</h1>
        <p>Drop your images, reorder them, and export a perfect PDF in seconds.</p>
      </div>

      {/* Options row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Page Size', value: pageSize, setter: setPageSize, options: [['a4','A4'],['letter','Letter'],['a3','A3'],['legal','Legal']] },
          { label: 'Orientation', value: orientation, setter: setOrientation, options: [['portrait','Portrait'],['landscape','Landscape']] },
          { label: 'Quality', value: quality, setter: setQuality, options: [['low','Low (Small file)'],['medium','Medium'],['high','High Quality']] },
        ].map(opt => (
          <div key={opt.label}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 8 }}>{opt.label}</label>
            <div className="relative">
              <select
                className="select-field"
                value={opt.value}
                onChange={e => opt.setter(e.target.value)}
              >
                {opt.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                style={{ color: 'var(--text-muted)' }}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone py-12 text-center mb-6 ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <i className="fa-solid fa-cloud-arrow-up text-4xl mb-4" style={{ color: 'var(--primary)', display: 'block' }}></i>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem', marginBottom: 6 }}>
          {isDragActive ? 'Drop images here...' : 'Drag & drop images here'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          or click to browse · JPG, PNG, WebP, GIF · Max 20MB each · Up to 50 images
        </p>
      </div>

      {/* Preview grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)' }}>
                {files.length} image{files.length !== 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => setFiles([])}
                className="text-sm flex items-center gap-1.5"
                style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-trash text-xs"></i> Clear all
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              <AnimatePresence>
                {files.map((file, i) => (
                  <FileThumb
                    key={`${file.name}-${i}`}
                    file={file}
                    index={i}
                    onRemove={remove}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                    total={files.length}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      {loading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Creating PDF...</span>
            <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Convert button */}
      <button
        className="btn-primary w-full justify-center text-base py-4"
        onClick={convertToPDF}
        disabled={loading || files.length === 0}
        style={{ opacity: (loading || files.length === 0) ? 0.6 : 1 }}
      >
        {loading ? (
          <><i className="fa-solid fa-spinner fa-spin"></i> Creating PDF...</>
        ) : (
          <><i className="fa-solid fa-file-pdf"></i> Convert {files.length > 0 ? `${files.length} image${files.length !== 1 ? 's' : ''}` : 'Images'} to PDF (1 credit)</>
        )}
      </button>
    </div>
  )
}

export default function ImageToPDF() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <CreditGuard>
        <ImageToPDFContent />
      </CreditGuard>
    </div>
  )
}
