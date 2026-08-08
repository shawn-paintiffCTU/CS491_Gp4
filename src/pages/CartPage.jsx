// Cart page: edits quantities, applies promotions, and summarizes the order.
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { calculateOrderTotals, formatCurrency } from "../utils/pricing";
import { useState } from "react";
import { validatePromotionCode } from "../services/promotionService.js";

function CartPage() {
  const {
    items,
    subtotalCents,
    appliedPromotion,
    discountCents,
    updateQuantity,
    removeItem,
    applyPromotion,
    removePromotion,
  } = useCart();

  const { taxCents, totalCents } = calculateOrderTotals(
    subtotalCents,
    discountCents,
  );
  const [promotionCode, setPromotionCode] = useState("");
  const [promotionMessage, setPromotionMessage] = useState("");
  const [promotionError, setPromotionError] = useState("");

  async function handlePromotionSubmit(event) {
    event.preventDefault();

    const result = await validatePromotionCode(promotionCode, subtotalCents);

    if (!result.isValid) {
      setPromotionError(result.message);
      setPromotionMessage("");
      return;
    }

    applyPromotion(result.promotion);
    setPromotionError("");
    setPromotionMessage(result.message);
    setPromotionCode("");
  }

  if (items.length === 0) {
    return (
      <section>
        <h2>Your Cart</h2>
        <p>Your cart is currently empty.</p>
        <Link to="/menu">Browse the menu</Link>
      </section>
    );
  }

  return (
    <section>
      <h2>Your Cart</h2>

      <div className="cart-items">
        {items.map((item) => (
          <article key={item.cartItemId} className="cart-item">
            <div>
              <h3>{item.name}</h3>

              {item.isCustomizable && (
                <>
                  <p>
                    {item.size.name} · {item.crust.name}
                  </p>

                  <p>
                    <strong>Toppings:</strong>{" "}
                    {item.toppings.length > 0
                      ? item.toppings.map((topping) => topping.name).join(", ")
                      : "None"}
                  </p>
                </>
              )}

              <p>{formatCurrency(item.unitPriceCents)} each</p>
            </div>

            <div className="quantity-controls">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.name}`}
                disabled={item.quantity === 1}
                onClick={() =>
                  updateQuantity(item.cartItemId, item.quantity - 1)
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
                  updateQuantity(item.cartItemId, item.quantity + 1)
                }
              >
                +
              </button>
            </div>

            <p>
              <strong>
                {formatCurrency(item.unitPriceCents * item.quantity)}
              </strong>
            </p>

            <button type="button" onClick={() => removeItem(item.cartItemId)}>
              Remove
            </button>
          </article>
        ))}
      </div>

      <section className="promotion-section">
        <h3>Promotion Code</h3>

        {appliedPromotion ? (
          <>
            <p>
              <strong>{appliedPromotion.code}</strong> —{" "}
              {appliedPromotion.description}
            </p>

            <button
              type="button"
              onClick={() => {
                removePromotion();
                setPromotionMessage("");
              }}
            >
              Remove promotion
            </button>
          </>
        ) : (
          <form onSubmit={handlePromotionSubmit}>
            <label htmlFor="promotion-code">Promotion code</label>

            <input
              id="promotion-code"
              type="text"
              value={promotionCode}
              maxLength="30"
              autoComplete="off"
              onChange={(event) =>
                setPromotionCode(event.target.value.toUpperCase())
              }
            />

            <button type="submit">Apply</button>
          </form>
        )}

        {promotionMessage && <p role="status">{promotionMessage}</p>}

        {promotionError && <p role="alert">{promotionError}</p>}
      </section>

      <section className="cart-summary">
        <h3>Order Summary</h3>

        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatCurrency(subtotalCents)}</dd>
          </div>

          {discountCents > 0 && (
            <div>
              <dt>Promotion discount</dt>
              <dd>−{formatCurrency(discountCents)}</dd>
            </div>
          )}

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
  );
}

export default CartPage;
