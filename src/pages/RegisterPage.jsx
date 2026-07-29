import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setMessage(
        'Password must be at least 6 characters long.',
      )
      return
    }

    setSubmitting(true)

    const { data, error } = await register(email, password)

    if (error) {
      setMessage(error.message)
      setSubmitting(false)
      return
    }

    if (!data.session) {
      setMessage(
        'Registration successful. Check your email to confirm your account.',
      )
      setSubmitting(false)
      return
    }

    navigate('/')
  }

  return (
    <main className="auth-page">
  <h1>Create Account</h1>

  <form className="auth-form" onSubmit={handleSubmit}>
    <div className="auth-field">
      <label htmlFor="register-email">Email</label>
      <input
        id="register-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
    </div>

    <div className="auth-field">
      <label htmlFor="register-password">Password</label>
      <input
        id="register-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
    </div>

    <div className="auth-field">
      <label htmlFor="confirm-password">
        Confirm Password
      </label>
      <input
        id="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(event) =>
          setConfirmPassword(event.target.value)
        }
        required
      />
    </div>

    <button type="submit" disabled={submitting}>
      {submitting ? 'Creating account...' : 'Register'}
    </button>
  </form>

  {message && <p className="auth-message">{message}</p>}

  <p>
    Already have an account?{' '}
    <Link to="/login">Login</Link>
  </p>
</main>
  )
}

export default RegisterPage