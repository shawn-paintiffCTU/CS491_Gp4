import { Link, Outlet } from 'react-router-dom'
import { useCart } from '../context/useCart'

function Layout() {
  const { itemCount } = useCart()
  return (
    <>
      <header>
        <h1>Plethora of Pizzas</h1>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/cart">Cart {itemCount > 0 && `(${itemCount})`} </Link>
          <Link to="/checkout">Checkout</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <p>© 2026 Plethora of Pizzas — School Project Demonstration</p>
      </footer>
    </>
  )
}

export default Layout