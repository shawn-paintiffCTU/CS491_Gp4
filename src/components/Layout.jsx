// Shared frame shown around every page: header, navigation, content, and footer.
import { Link, Outlet } from 'react-router-dom'
import { useCart } from '../context/cartContext'

function Layout() {
  const { itemCount } = useCart()
  return (
    <>
      <header>
        <h1>Plethora of PIES!</h1>

        <nav aria-label="Primary navigation">
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/cart">
            Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </Link>
          <Link to="/checkout">Checkout</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <p>2026 Plethora of PIES!: CTU CS491 Group4 Demonstration</p>
      </footer>
    </>
  )
}

export default Layout
