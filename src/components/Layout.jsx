// Shared frame shown around every page:
// header, navigation, content, and footer.

import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { itemCount } = useCart();
  const { user, isAdmin, logout } = useAuth();

  const navigate = useNavigate();

  async function handleLogout() {
    const { error } = await logout();

    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }

    navigate("/");
  }

  return (
    <>
      <header>
        <h1>Plethora of PIES!</h1>

        <nav aria-label="Primary navigation">
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>

          <Link to="/cart">
            Cart
            {itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>

          <Link to="/checkout">Checkout</Link>

          {user ? (
            <>
              <Link to="/account">My Account</Link>

              {isAdmin && (
                <>
                  <Link to="/admin/orders">Admin Orders</Link>

                  <Link to="/admin/menu">Admin Menu</Link>

                  <Link to="/admin/specials">Admin Specials</Link>
                </>
              )}

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

      <main>
        <Outlet />
      </main>

      <footer>
        <p>2026 Plethora of PIES!: CTU CS492 Group4 Demonstration</p>
      </footer>
    </>
  );
}

export default Layout;
