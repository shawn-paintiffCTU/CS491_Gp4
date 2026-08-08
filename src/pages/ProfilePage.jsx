import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  validateContactInformation,
} from '../utils/contactValidation'

function ProfilePage() {
  const {
    user,
    profile,
    role,
    loading,
    updateProfile,
  } = useAuth()

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return <p>Loading profile...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    const formData = new FormData(event.currentTarget)

    const validation = validateContactInformation({
      fullName: formData.get('fullName')?.toString() ?? '',
      phone: formData.get('phone')?.toString() ?? '',
    })

    setValidationErrors(validation.errors)

    if (!validation.isValid) {
      return
    }

    setSubmitting(true)

    const result = await updateProfile(validation.values)

    if (result.error) {
      setError(result.error.message)
      setSubmitting(false)
      return
    }

    setMessage('Your profile was updated.')
    setSubmitting(false)
  }

  return (
    <section className="auth-page">
      <h2>Your Profile</h2>

      <p>
        Signed in as <strong>{user.email}</strong>
      </p>

      <p>
        Account role: <strong>{role}</strong>
      </p>

      <form
        key={profile?.updated_at ?? 'new-profile'}
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="auth-field">
          <label htmlFor="profile-name">Full name</label>

          <input
            id="profile-name"
            name="fullName"
            type="text"
            defaultValue={profile?.full_name ?? ''}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="name"
            aria-invalid={Boolean(validationErrors.fullName)}
            aria-describedby={
              validationErrors.fullName
                ? 'profile-name-error'
                : undefined
            }
          />

          {validationErrors.fullName && (
            <p id="profile-name-error" role="alert">
              {validationErrors.fullName}
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="profile-phone">Phone number</label>

          <input
            id="profile-phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ''}
            maxLength={PHONE_MAX_LENGTH}
            autoComplete="tel"
            aria-invalid={Boolean(validationErrors.phone)}
            aria-describedby={
              validationErrors.phone
                ? 'profile-phone-error'
                : undefined
            }
          />

          {validationErrors.phone && (
            <p id="profile-phone-error" role="alert">
              {validationErrors.phone}
            </p>
          )}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}

export default ProfilePage