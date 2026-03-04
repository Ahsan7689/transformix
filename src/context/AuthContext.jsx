import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (id) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    setProfile(data)
  }

  const signUp = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (!error && data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        display_name: displayName || email.split('@')[0],
        total_ops: 0
      })
    }
    return { data, error }
  }

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signInGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })

  const signOut = () => supabase.auth.signOut()

  const updateProfile = async (updates) => {
    if (!user) return
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .maybeSingle()
    if (!error) setProfile(data)
    return { data, error }
  }

  return (
    <AuthCtx.Provider value={{ user, profile, loading, signUp, signIn, signInGoogle, signOut, updateProfile }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
