import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ShortLinkRedirect() {
  const { code } = useParams()
  const navigate  = useNavigate()

  useEffect(() => {
    const redirect = async () => {
      if (!code) { navigate('/'); return }

      const { data, error } = await supabase
        .from('short_links')
        .select('original_url, id, clicks')
        .eq('short_code', code)
        .maybeSingle()

      if (!data || error) {
        navigate('/404')
        return
      }

      // Increment click count (best-effort)
      supabase
        .from('short_links')
        .update({ clicks: (data.clicks || 0) + 1 })
        .eq('id', data.id)
        .then(() => {})

      window.location.href = data.original_url
    }

    redirect()
  }, [code, navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <i className="fa-solid fa-spinner fa-spin text-3xl" style={{ color: 'var(--primary)' }}></i>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>Redirecting...</p>
    </div>
  )
}
