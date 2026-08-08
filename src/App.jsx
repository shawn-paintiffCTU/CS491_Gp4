// Defines the application's pages and the URL assigned to each page.
import { lazy, Suspense } from 'react'
import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
} from 'react-router-dom'

import Layout from './components/Layout'
import './App.css'

// Pages are downloaded only when the corresponding route is opened.
const HomePage = lazy(() => import('./pages/HomePage'))
const MenuPage = lazy(() => import('./pages/MenuPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))

const PizzaCustomizerPage = lazy(() =>
  import('./pages/PizzaCustomizerPage'),
)

const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))

const AdminOrdersPage = lazy(() =>
  import('./pages/AdminOrdersPage'),
)

const AdminMenuPage = lazy(() =>
  import('./pages/AdminMenuPage'),
)

const AdminSpecialsPage = lazy(() =>
  import('./pages/AdminSpecialsPage'),
)

// Electron uses file URLs and therefore requires HashRouter.
// The hosted Vercel application uses normal browser URLs.
const Router =
  window.location.protocol === 'file:'
    ? HashRouter
    : BrowserRouter

function App() {
  return (
    <Router>
      <Suspense fallback={<p role="status">Loading page...</p>}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />

            <Route path="/menu" element={<MenuPage />} />

            <Route
              path="/menu/:itemId/customize"
              element={<PizzaCustomizerPage />}
            />

            <Route path="/cart" element={<CartPage />} />

            <Route
              path="/checkout"
              element={<CheckoutPage />}
            />

            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/register"
              element={<RegisterPage />}
            />

            <Route
              path="/account"
              element={<AccountPage />}
            />

            <Route
              path="/admin/orders"
              element={<AdminOrdersPage />}
            />

            <Route
              path="/admin/menu"
              element={<AdminMenuPage />}
            />

            <Route
              path="/admin/specials"
              element={<AdminSpecialsPage />}
            />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App