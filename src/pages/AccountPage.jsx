import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getUserProfile,
  saveUserProfile,
} from '../services/profileService'

function AccountPage() {
  const { user, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState('customer')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setProfileLoading(false)
      return
    }

    async function loadProfile() {
      setProfileLoading(true)
      setErrorMessage('')

      const {
        profile: loadedProfile,
        role: loadedRole,
        error,
      } = await getUserProfile(user.id)

      if (error) {
        setErrorMessage(
          `Unable to load profile: ${error.message}`,
        )
      }

      setProfile(loadedProfile)
      setRole(loadedRole)
      setFullName(loadedProfile?.full_name ?? '')
      setPhone(loadedProfile?.phone ?? '')
      setProfileLoading(false)
    }

    loadProfile()
  }, [user])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    if (fullName.trim().length > 100) {
      setErrorMessage(
        'Full name must be 100 characters or fewer.',
      )
      return
    }

    if (
      phone.trim() &&
      !/^[0-9()+\-\s]{7,20}$/.test(phone.trim())
    ) {
      setErrorMessage('Enter a valid phone number.')
      return
    }

    setSaving(true)

    const {
      profile: savedProfile,
      error,
    } = await saveUserProfile(user.id, {
      fullName,
      phone,
    })

    if (error) {
      setErrorMessage(
        `Unable to save profile: ${error.message}`,
      )
      setSaving(false)
      return
    }

    setProfile(savedProfile)
    setFullName(savedProfile?.full_name ?? '')
    setPhone(savedProfile?.phone ?? '')
    setMessage('Profile updated successfully.')
    setSaving(false)
  }

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
    <h2>
      Welcome back,{' '}
      {profile?.full_name?.trim() || user.email}!
    </h2>

    <h3>My Account</h3>

      {message && <p role="status">{message}</p>}
      {errorMessage && <p role="alert">{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="account-email">Email</label>
          <input
            id="account-email"
            type="email"
            value={user.email ?? ''}
            disabled
          />
        </div>

        <div>
          <label htmlFor="full-name">Full name</label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            maxLength="100"
            onChange={(event) =>
              setFullName(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="account-phone">Phone</label>
          <input
            id="account-phone"
            type="tel"
            value={phone}
            maxLength="20"
            onChange={(event) =>
              setPhone(event.target.value)
            }
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <section>
        <h3>Account Details</h3>

        <dl>
          <div>
            <dt>Role</dt>
            <dd>{role}</dd>
          </div>

          <div>
            <dt>Account created</dt>
            <dd>
              {profile?.created_at
                ? new Date(
                  profile.created_at,
                ).toLocaleString()
                : 'Not available'}
            </dd>
          </div>
        </dl>
      </section>
    </section>
  )
}

export default AccountPage