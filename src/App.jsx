// Defines the application's pages and the URL assigned to each page.
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PizzaCustomizerPage from "./pages/PizzaCustomizerPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminSpecialsPage from "./pages/AdminSpecialsPage";

import "./App.css";

// Electron opens a file URL, which needs hashes;
// the hosted site uses normal URLs.
const Router =
  window.location.protocol === "file:" ? HashRouter : BrowserRouter;

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />

          <Route
            path="/menu/:itemId/customize"
            element={<PizzaCustomizerPage />}
          />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/menu" element={<AdminMenuPage />} />
          <Route path="/admin/specials" element={<AdminSpecialsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
