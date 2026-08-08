import { supabase } from '../lib/supabase'

export async function getUserProfile(userId) {
  if (!userId) {
    return {
      profile: null,
      role: null,
      error: new Error('A user ID is required.'),
    }
  }

  const [
    { data: profile, error: profileError },
    { data: roleRecord, error: roleError },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, phone, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle(),

    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  return {
    profile,
    role: roleRecord?.role ?? 'customer',
    error: profileError ?? roleError,
  }
}export async function saveUserProfile(userId, profile) {
  if (!userId) {
    return {
      profile: null,
      error: new Error('A user ID is required.'),
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: profile.fullName.trim() || null,
      phone: profile.phone.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id, full_name, phone, created_at, updated_at')
    .single()

  return {
    profile: data,
    error,
  }
}