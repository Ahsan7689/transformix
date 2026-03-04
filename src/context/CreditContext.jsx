import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const CreditCtx = createContext(null)

// ── Credit rules ──────────────────────────────────────────
// guest : 25 initial, +10 every 28h, max 25
// auth  : 100 initial, +50 every 24h, max 100
// ──────────────────────────────────────────────────────────
const GUEST_INITIAL = 25
const GUEST_RESET   = 10
const GUEST_RESET_H = 28
const AUTH_INITIAL  = 100
const AUTH_RESET    = 50
const AUTH_RESET_H  = 24

// Separate localStorage key per user — guests get 'guest', auth users get their userId
function lsKey(userId) {
  return userId ? 'tx_credits_user_' + userId : 'tx_credits_guest'
}

function loadLocal(userId) {
  try {
    const raw = localStorage.getItem(lsKey(userId))
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function saveLocal(userId, data) {
  try { localStorage.setItem(lsKey(userId), JSON.stringify(data)) } catch {}
}

export function CreditProvider({ children }) {
  const [credits,   setCredits]   = useState(null)
  const [user,      setUser]      = useState(undefined) // undefined = still loading auth
  const [loading,   setLoading]   = useState(true)
  const [nextReset, setNextReset] = useState(null)
  const prevUserRef = useRef(undefined)

  // ── Watch Supabase auth state ──
  useEffect(() => {
    let unsub = null
    import('../lib/supabase.js').then(mod => {
      const sb = mod && mod.supabase
      if (!sb) {
        setUser(null) // no supabase → guest
        return
      }
      sb.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
      }).catch(() => setUser(null))

      const res = sb.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null)
      })
      unsub = res?.data?.subscription
    }).catch(() => setUser(null))
    return () => { if (unsub) unsub.unsubscribe() }
  }, [])

  // ── Load / compute credits whenever user identity changes ──
  const loadCredits = useCallback(() => {
    if (user === undefined) return // still resolving auth, wait
    setLoading(true)

    const now    = new Date()
    const uid    = user?.id ?? null
    const resetH = uid ? AUTH_RESET_H : GUEST_RESET_H
    const addAmt = uid ? AUTH_RESET   : GUEST_RESET
    const maxAmt = uid ? AUTH_INITIAL : GUEST_INITIAL
    const stored = loadLocal(uid)

    if (stored && stored.credits !== undefined && stored.last_reset) {
      const lastReset  = new Date(stored.last_reset)
      const hoursSince = (now - lastReset) / 3_600_000

      if (hoursSince >= resetH) {
        // Refill time — add credits up to max
        const newCredits = Math.min(stored.credits + addAmt, maxAmt)
        saveLocal(uid, { credits: newCredits, last_reset: now.toISOString() })
        setCredits(newCredits)
        setNextReset(new Date(now.getTime() + resetH * 3_600_000))
      } else {
        // Still valid — use exactly what's saved (no reset!)
        setCredits(stored.credits)
        setNextReset(new Date(new Date(stored.last_reset).getTime() + resetH * 3_600_000))
      }
    } else {
      // First time for this user/guest — give initial credits
      saveLocal(uid, { credits: maxAmt, last_reset: now.toISOString() })
      setCredits(maxAmt)
      setNextReset(new Date(now.getTime() + resetH * 3_600_000))
    }

    setLoading(false)
  }, [user])

  // Re-run loadCredits when user changes (login / logout)
  useEffect(() => {
    const prev = prevUserRef.current
    prevUserRef.current = user

    // On login: give auth user their OWN credits (not guest credits)
    // On logout: switch back to guest credits
    if (prev !== undefined && prev?.id !== user?.id) {
      loadCredits()
    } else {
      loadCredits()
    }
  }, [loadCredits, user])

  // ── Consume 1 credit ──
  const useCredit = useCallback(async () => {
    if (credits === null || credits <= 0) return false
    const uid    = user?.id ?? null
    const newVal = credits - 1
    setCredits(newVal)
    const stored = loadLocal(uid)
    saveLocal(uid, { ...(stored || {}), credits: newVal })
    return true
  }, [credits, user])

  return (
    <CreditCtx.Provider value={{ credits, user, loading, useCredit, nextReset, reload: loadCredits }}>
      {children}
    </CreditCtx.Provider>
  )
}

export const useCredit = () => useContext(CreditCtx)
