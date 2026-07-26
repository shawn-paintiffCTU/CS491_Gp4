import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      <header>
        <h1>Plethora of PIES!</h1>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/cart">
            Cart {itemCount > 0 && `(${itemCount})`}
          </Link>
          <Link to="/checkout">Checkout</Link>

          {isAuthenticated ? (
            <>
              <span>Welcome, {user?.name}</span>

              <button type="button" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log In</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <p>
          2026 Plethora of PIES!: CTU CS491 Group4 Demonstration
        </p>
      </footer>
    </>
  );
}

export default Layout;