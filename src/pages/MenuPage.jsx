// Menu page: groups active products and sends selected items to the cart.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getMenu,
  getPizzaOptions,
} from '../services/menuService.js'
import {
  calculatePizzaPrice,
  formatCurrency,
} from '../utils/pricing'
import { useCart } from '../context/CartContext'
import FloatingNotification from '../components/FloatingNotification'
import { useFloatingNotification } from '../hooks/useFloatingNotification'

function MenuPage() {
  const [categories, setCategories] = useState([])
  const [pizzaOptions, setPizzaOptions] = useState({
    sizes: [],
    crusts: [],
    toppings: [],
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const { addItem } = useCart()

  const { notification, showNotification } =
    useFloatingNotification()

  useEffect(() => {
    async function loadMenu() {
      try {
        const [menu, options] = await Promise.all([
          getMenu(),
          getPizzaOptions(),
        ])

        setCategories(menu)
        setPizzaOptions(options)
      } catch {
        setError(
          'The menu could not be loaded. Please try again later.',
        )
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

    showNotification(
      `${item.name} added to cart.`,
      event,
    )
  }

  function handleAddDefaultPizza(item, event) {
    const defaultSize = pizzaOptions.sizes[0]
    const defaultCrust = pizzaOptions.crusts[0]

    const includedToppings =
      pizzaOptions.toppings.filter((topping) =>
        item.includedToppingIds.includes(topping.id),
      )

    const unitPriceCents = calculatePizzaPrice({
      basePriceCents: item.basePriceCents,
      size: defaultSize,
      crust: defaultCrust,
      toppings: includedToppings,
      includedToppingIds: item.includedToppingIds,
    })

    addItem({
      menuItemId: item.id,
      name: item.name,
      size: defaultSize,
      crust: defaultCrust,
      toppings: includedToppings,
      unitPriceCents,
      quantity: 1,
      isCustomizable: true,
    })

    showNotification(
      `${item.name} added to cart.`,
      event,
    )
  }

  if (isLoading) {
    return <p>Loading menu...</p>
  }

  if (error) {
    return <p role="alert">{error}</p>
  }

  return (
    <section>
      <FloatingNotification
        notification={notification}
      />

      <h2>Our Menu</h2>

      <p>Browse our pizzas, sides, and drinks.</p>

      {categories.map((category) => (
        <section
          key={category.id}
          className="menu-category"
        >
          <h3>{category.name}</h3>
          <p>{category.description}</p>

          <div className="menu-grid">
            {category.items.map((item) => {
              const supportsQuickAdd =
                item.isCustomizable &&
                item.includedToppingIds.length > 0

              return (
                <article
                  key={item.id}
                  className="menu-card"
                >
                  <h4>{item.name}</h4>

                  <p>{item.description}</p>

                  <p className="menu-price">
                    <strong>
                      {formatCurrency(
                        item.basePriceCents,
                      )}
                    </strong>
                  </p>

                  <div className="menu-card-actions">
                    {supportsQuickAdd && (
                      <button
                        type="button"
                        onClick={(event) =>
                          handleAddDefaultPizza(
                            item,
                            event,
                          )
                        }
                      >
                        Add to Cart
                      </button>
                    )}

                    {item.isCustomizable ? (
                      <Link
                        className="menu-action-link"
                        to={`/menu/${item.id}/customize`}
                      >
                        Customize
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={(event) =>
                          handleAddStandardItem(
                            item,
                            event,
                          )
                        }
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </section>
  )
}

export default MenuPage