// Menu page: groups active products and sends selected items to the cart.
import { useEffect, useState } from 'react'
import { getMenu } from '../services/menuService.js'
import { formatCurrency } from '../utils/pricing'
import { Link } from 'react-router-dom'
import { useCart } from '../context/cartContext'
import FloatingNotification from '../components/FloatingNotification'
import { useFloatingNotification } from '../hooks/useFloatingNotification'

function MenuPage() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()
  const { notification, showNotification } =
    useFloatingNotification()

  useEffect(() => {
    async function loadMenu() {
      try {
        const menu = await getMenu()
        setCategories(menu)
      } catch {
        setError('The menu could not be loaded. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    loadMenu()
  }, [])

  function handleAddStandardItem(item, event) {
    addItem({
      menuItemId: item.id,
      name: item.name,
      unitPriceCents: item.basePriceCents,
      quantity: 1,
      isCustomizable: false,
    })

    showNotification(`${item.name} added to cart.`, event)
  }

  if (isLoading) {
    return <p>Loading menu...</p>
  }

  if (error) {
    return <p role="alert">{error}</p>
  }

  return (
    <section>
      <FloatingNotification notification={notification} />
      <h2>Our Menu</h2>
      <p>Browse our pizzas, sides, and drinks.</p>

      {categories.map((category) => (
        <section key={category.id} className="menu-category">
          <h3>{category.name}</h3>
          <p>{category.description}</p>

          <div className="menu-grid">
            {category.items.map((item) => (
              <article key={item.id} className="menu-card">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p>
                  <strong>{formatCurrency(item.basePriceCents)}</strong>
                </p>

                {item.isCustomizable ? (
                  <Link to={`/menu/${item.id}/customize`}>
                    Customize
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={(event) =>
                      handleAddStandardItem(item, event)
                    }
                  >
                    Add to cart
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}

export default MenuPage
