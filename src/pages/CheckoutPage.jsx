// Pickup-only demonstration checkout with contact validation and confirmation.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import {
  calculateOrderTotals,
  formatCurrency,
} from '../utils/pricing'
import {
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  validateContactInformation,
} from '../utils/contactValidation'

function CheckoutPage() {
  const {
    items,
    itemCount,
    subtotalCents,
    appliedPromotion,
    discountCents,
    clearCart,
  } = useCart()

  const { user, profile } = useAuth()

  const [errors, setErrors] = useState({})
  const [completedOrder, setCompletedOrder] = useState(null)

  const { taxCents, totalCents } = calculateOrderTotals(
    subtotalCents,
    discountCents,
  )

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const validation = validateContactInformation({
      fullName: formData.get('fullName')?.toString() ?? '',
      phone: formData.get('phone')?.toString() ?? '',
    })

    setErrors(validation.errors)

    if (!validation.isValid) {
      return
    }

    // Preserve the displayed confirmation totals before clearing shared cart state.
    setCompletedOrder({
      itemCount,
      totalCents,
    })

    clearCart()
  }

  if (completedOrder) {
    return (
      <section>
        <h2>Test Order Confirmed</h2>

        <p role="status">
          Your demonstration order for {completedOrder.itemCount}{' '}
          {completedOrder.itemCount === 1 ? 'item' : 'items'} was
          successfully created.
        </p>

        <p>
          <strong>
            Demonstration total:{' '}
            {formatCurrency(completedOrder.totalCents)}
          </strong>
        </p>

        <p>
          <strong>Fulfillment method:</strong> Pickup
        </p>

        <p>
          No payment was processed and no checkout information was
          stored with this demonstration order.
        </p>

        <Link to="/menu">Return to menu</Link>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section>
        <h2>Checkout</h2>
        <p>Your cart is empty.</p>
        <Link to="/menu">Browse the menu</Link>
      </section>
    )
  }

  return (
    <section>
      <h2>Checkout</h2>

      <p role="note">
        <strong>School project demonstration:</strong> No payment is
        processed. Do not enter real or sensitive information.
      </p>

      <form
        key={
          profile?.updated_at ??
          user?.id ??
          'guest-checkout'
        }
        onSubmit={handleSubmit}
        noValidate
      >
        <section className="pickup-notice">
          <h3>Pickup Order</h3>
          <p>
            All online orders must be picked up at the restaurant.
          </p>
        </section>

        <fieldset>
          <legend>Contact information</legend>

          <label htmlFor="customer-name">Name</label>
          <input
            id="customer-name"
            name="fullName"
            type="text"
            defaultValue={profile?.full_name ?? ''}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="name"
            aria-describedby={
              errors.fullName
                ? 'customer-name-error'
                : undefined
            }
            aria-invalid={Boolean(errors.fullName)}
          />

          {errors.fullName && (
            <p id="customer-name-error" role="alert">
              {errors.fullName}
            </p>
          )}

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ''}
            maxLength={PHONE_MAX_LENGTH}
            autoComplete="tel"
            aria-describedby={
              errors.phone ? 'phone-error' : undefined
            }
            aria-invalid={Boolean(errors.phone)}
          />

          {errors.phone && (
            <p id="phone-error" role="alert">
              {errors.phone}
            </p>
          )}
        </fieldset>

        <section>
          <h3>Order Summary</h3>
          <p>Items: {itemCount}</p>
          <p>Subtotal: {formatCurrency(subtotalCents)}</p>

          {appliedPromotion && discountCents > 0 && (
            <>
              <p>Promotion: {appliedPromotion.code}</p>
              <p>
                Discount: −{formatCurrency(discountCents)}
              </p>
            </>
          )}

          <p>Estimated tax: {formatCurrency(taxCents)}</p>

          <p>
            <strong>Total: {formatCurrency(totalCents)}</strong>
          </p>
        </section>

        <button type="submit">Place test order</button>
      </form>
    </section>
  )
}

export default CheckoutPage