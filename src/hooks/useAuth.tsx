import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'

type Profile = Tables<'profiles'>

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username: string, userType: string) => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to fetch profile')
        return
      }
      
      setProfile(data as Profile | null)
      setError(null)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to fetch profile')
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Failed to sign out')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
      return { error }
    }
  }

  const signUp = async (email: string, password: string, username: string, userType: string) => {
    try {
      setError(null)
      const redirectUrl = `${window.location.origin}/`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            user_type: userType,
          },
        },
      })

      if (error) {
        setError(error.message)
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const redirectUrl = `${window.location.origin}/reset-password`
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        setError(error.message)
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
      return { error }
    }
  }

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Defer profile fetching to avoid recursion
      if (session?.user) {
        setTimeout(() => {
          if (mounted) {
            refreshProfile()
          }
        }, 100)
      } else {
        setProfile(null)
      }
    })

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return;
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              refreshProfile()
            }
          }, 100)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signOut,
    refreshProfile,
    signIn,
    signUp,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
