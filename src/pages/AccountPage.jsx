import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AccountPage() {
  const { user, loading } = useAuth()

  if (loading) {
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

  return (
    <section className="account-page">
      <h2>My Account</h2>

      <dl>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>

        <div>
          <dt>Account ID</dt>
          <dd>{user.id}</dd>
        </div>

        <div>
          <dt>Account created</dt>
          <dd>
            {user.created_at
              ? new Date(user.created_at).toLocaleString()
              : 'Not available'}
          </dd>
        </div>
      </dl>

      <p>
        Additional profile details and order history will be added
        during Sprint 2.
      </p>
    </section>
  )
}

export default AccountPage