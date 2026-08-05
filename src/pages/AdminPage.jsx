import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminPage() {
  const {
    user,
    role,
    isAdmin,
    isManager,
    loading,
  } = useAuth()

  if (loading) {
    return <p>Checking account permissions...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isManager) {
    return (
      <section>
        <h2>Access Denied</h2>

        <p>
          Your account does not have permission to access
          management features.
        </p>

        <Link to="/">Return to home</Link>
      </section>
    )
  }

  return (
    <section>
      <h2>Management Dashboard</h2>

      <p>
        Signed in as <strong>{user.email}</strong>
      </p>

      <p>
        Account role: <strong>{role}</strong>
      </p>

      {isAdmin ? (
        <p>
          Administrators can manage accounts, roles, and website
          content.
        </p>
      ) : (
        <p>
          Managers can manage website content but cannot assign
          account roles.
        </p>
      )}

      <section>
        <h3>Management Features</h3>

        <p>
          Menu, promotion, restaurant, and account-management
          controls will appear here as they are implemented.
        </p>
      </section>
    </section>
  )
}

export default AdminPage