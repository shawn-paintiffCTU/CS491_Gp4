// Pizza builder: selects options, calculates a live price, and adds the result.
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMenuItem, getPizzaOptions } from "../services/menuService.js";
import { calculatePizzaPrice, formatCurrency } from "../utils/pricing";
import { useCart } from "../context/CartContext";
import FloatingNotification from "../components/FloatingNotification";
import { useFloatingNotification } from "../hooks/useFloatingNotification";

function PizzaCustomizerPage() {
  const { itemId } = useParams();

  const { addItem } = useCart();
  const { notification, showNotification } = useFloatingNotification();

  const [pizza, setPizza] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [crusts, setCrusts] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [selectedCrustId, setSelectedCrustId] = useState(null);
  const [selectedToppingIds, setSelectedToppingIds] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadCustomizer() {
      try {
        const [menuItem, options] = await Promise.all([
          getMenuItem(itemId),
          getPizzaOptions(),
        ]);

        if (!menuItem || !menuItem.isCustomizable) {
          setError("This pizza is not available for customization.");
          return;
        }

        setPizza(menuItem);
        setSizes(options.sizes);
        setCrusts(options.crusts);
        setToppings(options.toppings);
        setSelectedSizeId(options.sizes[0]?.id ?? null);
        setSelectedCrustId(options.crusts[0]?.id ?? null);
        setSelectedToppingIds(menuItem.includedToppingIds);
      } catch {
        setError("The pizza customizer could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomizer();
  }, [itemId]);

  const selectedSize = useMemo(
    () => sizes.find((size) => size.id === selectedSizeId),
    [sizes, selectedSizeId],
  );

  const selectedCrust = useMemo(
    () => crusts.find((crust) => crust.id === selectedCrustId),
    [crusts, selectedCrustId],
  );

  const selectedToppings = useMemo(
    () => toppings.filter((topping) => selectedToppingIds.includes(topping.id)),
    [toppings, selectedToppingIds],
  );

  const totalPriceCents = useMemo(() => {
    if (!pizza) {
      return 0;
    }

    return calculatePizzaPrice({
      basePriceCents: pizza.basePriceCents,
      size: selectedSize,
      crust: selectedCrust,
      toppings: selectedToppings,
      includedToppingIds: pizza.includedToppingIds,
    });
  }, [pizza, selectedSize, selectedCrust, selectedToppings]);

  function toggleTopping(toppingId) {
    setSelectedToppingIds((currentIds) =>
      currentIds.includes(toppingId)
        ? currentIds.filter((id) => id !== toppingId)
        : [...currentIds, toppingId],
    );
  }

  function handleAddToCart(event) {
    if (!selectedSize || !selectedCrust) {
      return;
    }

    addItem({
      menuItemId: pizza.id,
      name: pizza.name,
      size: selectedSize,
      crust: selectedCrust,
      toppings: selectedToppings,
      unitPriceCents: totalPriceCents,
      quantity,
      isCustomizable: true,
    });

    showNotification(`${pizza.name} added to cart.`, event);
  }

  if (isLoading) {
    return <p>Loading pizza customizer...</p>;
  }

  if (error) {
    return (
      <section>
        <p role="alert">{error}</p>
        <Link to="/menu">Return to menu</Link>
      </section>
    );
  }

  return (
    <section className="pizza-customizer">
      <FloatingNotification notification={notification} />

      <Link to="/menu">← Back to menu</Link>

      <h2>Customize {pizza.name}</h2>
      <p>{pizza.description}</p>

      <fieldset>
        <legend>Choose a size</legend>

        <div className="customizer-option-grid">
          {sizes.map((size) => (
            <label
              key={size.id}
              className="customizer-option"
            >
              <input
                type="radio"
                name="pizza-size"
                value={size.id}
                checked={selectedSizeId === size.id}
                onChange={() =>
                  setSelectedSizeId(size.id)
                }
              />

              <span>
                {size.name}

                {size.priceAdjustmentCents > 0 &&
                  ` (+${formatCurrency(
                    size.priceAdjustmentCents,
                  )})`}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Choose a crust</legend>

        <div className="customizer-option-grid">
          {crusts.map((crust) => (
            <label
              key={crust.id}
              className="customizer-option"
            >
              <input
                type="radio"
                name="pizza-crust"
                value={crust.id}
                checked={
                  selectedCrustId === crust.id
                }
                onChange={() =>
                  setSelectedCrustId(crust.id)
                }
              />

              <span>
                {crust.name}

                {crust.priceAdjustmentCents > 0 &&
                  ` (+${formatCurrency(
                    crust.priceAdjustmentCents,
                  )})`}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Choose toppings</legend>

        <div className="customizer-option-grid customizer-toppings">
          {toppings.map((topping) => {
            const isIncluded =
              pizza.includedToppingIds.includes(
                topping.id,
              )

            return (
              <label
                key={topping.id}
                className="customizer-option"
              >
                <input
                  type="checkbox"
                  checked={selectedToppingIds.includes(
                    topping.id,
                  )}
                  onChange={() =>
                    toggleTopping(topping.id)
                  }
                />

                <span>
                  {topping.name}

                  {isIncluded
                    ? ' (included)'
                    : ` (+${formatCurrency(
                      topping.priceCents,
                    )})`}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="customizer-quantity">
        <legend>Quantity</legend>

        <div className="customizer-quantity-row">
          <label htmlFor="pizza-quantity">
            Number of pizzas
          </label>

          <select
            id="pizza-quantity"
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Number(event.target.value),
              )
            }
          >
            {Array.from(
              { length: 10 },
              (_, index) => {
                const optionQuantity = index + 1

                return (
                  <option
                    key={optionQuantity}
                    value={optionQuantity}
                  >
                    {optionQuantity}
                  </option>
                )
              },
            )}
          </select>
        </div>
      </fieldset>

      <section
        className="customizer-summary"
        aria-live="polite"
      >
        <h3>Customization Summary</h3>

        <div className="customizer-summary-values">
          <p>
            Price each:{' '}
            <strong>
              {formatCurrency(totalPriceCents)}
            </strong>
          </p>

          <p>
            Quantity: <strong>{quantity}</strong>
          </p>

          <p>
            Total:{' '}
            <strong>
              {formatCurrency(
                totalPriceCents * quantity,
              )}
            </strong>
          </p>
        </div>
      </section>

      <button
        type="button"
        className="customizer-add-button"
        disabled={!selectedSize || !selectedCrust}
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </section>
  );
}

export default PizzaCustomizerPage;
