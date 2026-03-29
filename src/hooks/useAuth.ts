import { useEffect, useState } from 'react'

import type { User } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

interface UseAuthReturn {
  user: User | null
  loading: boolean
}

/**
 * Manages anonymous auth session via Supabase.
 * On first load, checks for existing session. If none exists,
 * creates an anonymous guest session. Session persists via localStorage.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function initAuth(): Promise<void> {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          if (mounted) setUser(session.user)
        } else {
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error) throw error
          if (mounted && data.user) setUser(data.user)
        }
      } catch {
        // Auth failure is non-recoverable for anon — let the UI show empty state
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
