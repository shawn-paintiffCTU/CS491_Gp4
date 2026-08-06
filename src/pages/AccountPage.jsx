import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProfile } from '../services/profileService'

function AccountPage() {
  const { user, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState('customer')
  const [profileLoading, setProfileLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setProfileLoading(false)
      return
    }

    async function loadProfile() {
      setProfileLoading(true)
      setMessage('')

      const {
        profile: loadedProfile,
        role: loadedRole,
        error,
      } = await getUserProfile(user.id)

      if (error) {
        setMessage(`Unable to load profile: ${error.message}`)
      }

      setProfile(loadedProfile)
      setRole(loadedRole)
      setProfileLoading(false)
    }

    loadProfile()
  }, [user])

  if (authLoading) {
    return (
      <section>
        <h2>My Account</h2>
        <p>Loading account...</p>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profileLoading) {
    return (
      <section>
        <h2>My Account</h2>
        <p>Loading profile...</p>
      </section>
    )
  }

  return (
    <section className="account-page">
      <h2>My Account</h2>

      {message && <p role="alert">{message}</p>}

      <dl>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>

        <div>
          <dt>Full name</dt>
          <dd>{profile?.full_name || 'Not provided'}</dd>
        </div>

        <div>
          <dt>Phone</dt>
          <dd>{profile?.phone || 'Not provided'}</dd>
        </div>

        <div>
          <dt>Account role</dt>
          <dd>{role}</dd>
        </div>

        <div>
          <dt>Account created</dt>
          <dd>
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleString()
              : 'Not available'}
          </dd>
        </div>
      </dl>
    </section>
  )
}

export default AccountPage