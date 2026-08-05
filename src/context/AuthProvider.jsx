import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './AuthContext'

const DEFAULT_ROLE = 'customer'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    async function loadAccount(authUser) {
      if (!authUser) {
        if (isActive) {
          setUser(null)
          setProfile(null)
          setRole(null)
          setLoading(false)
        }

        return
      }

      if (isActive) {
        setLoading(true)
        setUser(authUser)
      }

      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'id, full_name, phone, created_at, updated_at',
          )
          .eq('id', authUser.id)
          .maybeSingle(),

        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .maybeSingle(),
      ])

      if (!isActive) {
        return
      }

      if (profileResult.error) {
        console.error(
          'Profile error:',
          profileResult.error.message,
        )
      }

      if (roleResult.error) {
        console.error(
          'Role error:',
          roleResult.error.message,
        )
      }

      setProfile(profileResult.data ?? null)
      setRole(roleResult.data?.role ?? DEFAULT_ROLE)
      setLoading(false)
    }

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session error:', error.message)
      }

      await loadAccount(data.session?.user ?? null)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadAccount(session?.user ?? null)
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  function register(email, password) {
    return supabase.auth.signUp({
      email,
      password,
    })
  }

  function login(email, password) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  function logout() {
    return supabase.auth.signOut()
  }

  async function updateProfile({ fullName, phone }) {
    if (!user) {
      return {
        data: null,
        error: new Error('You must be signed in.'),
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
      })
      .eq('id', user.id)
      .select('id, full_name, phone, created_at, updated_at')
      .single()

    if (!error) {
      setProfile(data)
    }

    return { data, error }
  }

  const isAdmin = role === 'admin'
  const isManager = role === 'manager' || isAdmin

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isManager,
        loading,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}