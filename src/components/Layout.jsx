// Shared frame shown around every page: header, navigation, content, and footer.
import {
  Link,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    const { error } = await logout()

    if (error) {
      console.error('Logout error:', error.message)
      return
    }

    navigate('/')
  }

  return (
    <>
      <header>
        <h1>Plethora of PIES!</h1>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/checkout">Checkout</Link>

          {user ? (
            <>
              <span>{user.email}</span>

              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <Outlet />

      <footer>
        2026 Plethora of PIES!: CTU CS491 Group4 Demonstration
      </footer>
    </>
  )
}

export default Layout
