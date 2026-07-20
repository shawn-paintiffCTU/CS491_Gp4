import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { formatCurrency } from '../utils/formatCurrency'

const TAX_RATE = 0.08

function CartPage() {
  const {
    items,
    subtotalCents,
    updateQuantity,
    removeItem,
  } = useCart()

  const taxCents = Math.round(subtotalCents * TAX_RATE)
  const totalCents = subtotalCents + taxCents

  if (items.length === 0) {
    return (
      <section>
        <h2>Your Cart</h2>
        <p>Your cart is currently empty.</p>
        <Link to="/menu">Browse the menu</Link>
      </section>
    )
  }

  return (
    <section>
      <h2>Your Cart</h2>

      <div className="cart-items">
        {items.map((item) => (
          <article key={item.cartItemId} className="cart-item">
            <div>
              <h3>{item.name}</h3>

              <p>
                {item.size.name} · {item.crust.name}
              </p>

              <p>
                <strong>Toppings:</strong>{' '}
                {item.toppings.length > 0
                  ? item.toppings
                      .map((topping) => topping.name)
                      .join(', ')
                  : 'None'}
              </p>

              <p>
                {formatCurrency(item.unitPriceCents)} each
              </p>
            </div>

            <div className="quantity-controls">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.name}`}
                disabled={item.quantity === 1}
                onClick={() =>
                  updateQuantity(
                    item.cartItemId,
                    item.quantity - 1,
                  )
                }
              >
                −
              </button>

              <span aria-label={`Quantity: ${item.quantity}`}>
                {item.quantity}
              </span>

              <button
                type="button"
                aria-label={`Increase quantity of ${item.name}`}
                onClick={() =>
                  updateQuantity(
                    item.cartItemId,
                    item.quantity + 1,
                  )
                }
              >
                +
              </button>
            </div>

            <p>
              <strong>
                {formatCurrency(
                  item.unitPriceCents * item.quantity,
                )}
              </strong>
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.cartItemId)}
            >
              Remove
            </button>
          </article>
        ))}
      </div>

      <section className="cart-summary">
        <h3>Order Summary</h3>

        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatCurrency(subtotalCents)}</dd>
          </div>

          <div>
            <dt>Estimated tax</dt>
            <dd>{formatCurrency(taxCents)}</dd>
          </div>

          <div>
            <dt>Total</dt>
            <dd>
              <strong>{formatCurrency(totalCents)}</strong>
            </dd>
          </div>
        </dl>

        <Link to="/checkout">Continue to checkout</Link>
      </section>
    </section>
  )
}

export default CartPage