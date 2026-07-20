import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getMenuItem,
  getPizzaOptions,
} from '../services/menuService'
import { calculatePizzaPrice } from '../utils/calculatePizzaPrice'
import { formatCurrency } from '../utils/formatCurrency'

function PizzaCustomizerPage() {
  const { itemId } = useParams()

  const [pizza, setPizza] = useState(null)
  const [sizes, setSizes] = useState([])
  const [crusts, setCrusts] = useState([])
  const [toppings, setToppings] = useState([])
  const [selectedSizeId, setSelectedSizeId] = useState(null)
  const [selectedCrustId, setSelectedCrustId] = useState(null)
  const [selectedToppingIds, setSelectedToppingIds] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCustomizer() {
      try {
        const [menuItem, options] = await Promise.all([
          getMenuItem(itemId),
          getPizzaOptions(),
        ])

        if (!menuItem || !menuItem.isCustomizable) {
          setError('This pizza is not available for customization.')
          return
        }

        setPizza(menuItem)
        setSizes(options.sizes)
        setCrusts(options.crusts)
        setToppings(options.toppings)
        setSelectedSizeId(options.sizes[0]?.id ?? null)
        setSelectedCrustId(options.crusts[0]?.id ?? null)
        setSelectedToppingIds(menuItem.includedToppingIds)
      } catch {
        setError('The pizza customizer could not be loaded.')
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomizer()
  }, [itemId])

  const selectedSize = sizes.find(
    (size) => size.id === selectedSizeId,
  )

  const selectedCrust = crusts.find(
    (crust) => crust.id === selectedCrustId,
  )

  const selectedToppings = toppings.filter((topping) =>
    selectedToppingIds.includes(topping.id),
  )

  const totalPriceCents = useMemo(() => {
    if (!pizza) {
      return 0
    }

    return calculatePizzaPrice({
      basePriceCents: pizza.basePriceCents,
      size: selectedSize,
      crust: selectedCrust,
      toppings: selectedToppings,
      includedToppingIds: pizza.includedToppingIds,
    })
  }, [pizza, selectedSize, selectedCrust, selectedToppings])

  function toggleTopping(toppingId) {
    setSelectedToppingIds((currentIds) =>
      currentIds.includes(toppingId)
        ? currentIds.filter((id) => id !== toppingId)
        : [...currentIds, toppingId],
    )
  }

  if (isLoading) {
    return <p>Loading pizza customizer...</p>
  }

  if (error) {
    return (
      <section>
        <p role="alert">{error}</p>
        <Link to="/menu">Return to menu</Link>
      </section>
    )
  }

  return (
    <section>
      <Link to="/menu">← Back to menu</Link>

      <h2>Customize {pizza.name}</h2>
      <p>{pizza.description}</p>

      <fieldset>
        <legend>Choose a size</legend>

        {sizes.map((size) => (
          <label key={size.id}>
            <input
              type="radio"
              name="pizza-size"
              value={size.id}
              checked={selectedSizeId === size.id}
              onChange={() => setSelectedSizeId(size.id)}
            />

            {size.name}

            {size.priceAdjustmentCents > 0 &&
              ` (+${formatCurrency(size.priceAdjustmentCents)})`}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Choose a crust</legend>

        {crusts.map((crust) => (
          <label key={crust.id}>
            <input
              type="radio"
              name="pizza-crust"
              value={crust.id}
              checked={selectedCrustId === crust.id}
              onChange={() => setSelectedCrustId(crust.id)}
            />

            {crust.name}

            {crust.priceAdjustmentCents > 0 &&
              ` (+${formatCurrency(crust.priceAdjustmentCents)})`}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Choose toppings</legend>

        {toppings.map((topping) => {
          const isIncluded = pizza.includedToppingIds.includes(
            topping.id,
          )

          return (
            <label key={topping.id}>
              <input
                type="checkbox"
                checked={selectedToppingIds.includes(topping.id)}
                onChange={() => toggleTopping(topping.id)}
              />

              {topping.name}

              {isIncluded
                ? ' (included)'
                : ` (+${formatCurrency(topping.priceCents)})`}
            </label>
          )
        })}
      </fieldset>

      <section aria-live="polite">
        <h3>Current price: {formatCurrency(totalPriceCents)}</h3>
      </section>

      <button type="button">Add to cart</button>
    </section>
  )
}

export default PizzaCustomizerPage