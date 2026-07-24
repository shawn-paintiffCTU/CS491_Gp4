import {
  BrowserRouter, HashRouter, Route, Routes,
} from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import './App.css'
import PizzaCustomizerPage from './pages/PizzaCustomizerPage'

const Router =
  window.location.protocol === 'file:'
    ? HashRouter
    : BrowserRouter

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:itemId/customize" element={<PizzaCustomizerPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App