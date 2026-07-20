import { useEffect, useState } from 'react'
import { getMenu } from '../services/menuService'
import { formatCurrency } from '../utils/formatCurrency'
import { Link } from 'react-router-dom'

function MenuPage() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return <p>Loading menu...</p>
  }

  if (error) {
    return <p role="alert">{error}</p>
  }

  return (
    <section>
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

                {item.isCustomizable && (
                  <Link to={`/menu/${item.id}/customize`}>
                    Customize
                  </Link>
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