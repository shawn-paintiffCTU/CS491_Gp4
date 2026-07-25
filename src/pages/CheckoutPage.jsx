// Pickup-only demonstration checkout with contact validation and confirmation.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/cartContext'
import {
  calculateOrderTotals,
  formatCurrency,
} from '../utils/pricing'

function CheckoutPage() {
  const {
    items,
    itemCount,
    subtotalCents,
    appliedPromotion,
    discountCents,
    clearCart,
  } = useCart()

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState({})
  const [completedOrder, setCompletedOrder] = useState(null)

  const { taxCents, totalCents } = calculateOrderTotals(
    subtotalCents,
    discountCents,
  )

  // Client-side checks provide immediate feedback before the demo submission.
  function validateForm() {
    const validationErrors = {}

    if (customerName.trim().length < 2) {
      validationErrors.customerName = 'Enter your name.'
    }

    if (!/^[0-9()+\-\s]{7,20}$/.test(phone.trim())) {
      validationErrors.phone = 'Enter a valid phone number.'
    }

    setErrors(validationErrors)

    return Object.keys(validationErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
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
          No payment was processed and no customer information was
          transmitted or stored.
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

      <form onSubmit={handleSubmit} noValidate>

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
            type="text"
            value={customerName}
            maxLength="100"
            aria-describedby={
              errors.customerName ? 'customer-name-error' : undefined
            }
            aria-invalid={Boolean(errors.customerName)}
            onChange={(event) => setCustomerName(event.target.value)}
          />

          {errors.customerName && (
            <p id="customer-name-error" role="alert">
              {errors.customerName}
            </p>
          )}

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            maxLength="20"
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={Boolean(errors.phone)}
            onChange={(event) => setPhone(event.target.value)}
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
              <p>
                Promotion: {appliedPromotion.code}
              </p>
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
