// Demonstration checkout with pickup/delivery,
// contact validation, delivery information,
// simulated payment entry, and order confirmation.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../services/orderService'
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

  const { user } = useAuth()

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')

  const [fulfillmentMethod, setFulfillmentMethod] =
    useState('pickup')

  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [cvv, setCvv] = useState('')

  const [errors, setErrors] = useState({})
  const [completedOrder, setCompletedOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')

  const { taxCents, totalCents } = calculateOrderTotals(
    subtotalCents,
    discountCents,
  )

  function validateForm() {
    const validationErrors = {}

    if (customerName.trim().length < 2) {
      validationErrors.customerName =
        'Enter your name.'
    }

    if (!/^[0-9()+\-\s]{7,20}$/.test(phone.trim())) {
      validationErrors.phone =
        'Enter a valid phone number.'
    }

    if (fulfillmentMethod === 'delivery') {
      if (streetAddress.trim().length < 5) {
        validationErrors.streetAddress =
          'Enter a valid street address.'
      }

      if (city.trim().length < 2) {
        validationErrors.city =
          'Enter a valid city.'
      }

      if (!/^[A-Za-z]{2}$/.test(state.trim())) {
        validationErrors.state =
          'Enter a 2-letter state abbreviation.'
      }

      if (!/^\d{5}(-\d{4})?$/.test(zipCode.trim())) {
        validationErrors.zipCode =
          'Enter a valid ZIP code.'
      }
    }

    if (cardName.trim().length < 2) {
      validationErrors.cardName =
        'Enter the name shown on the demo card.'
    }

    const cardDigits =
      cardNumber.replace(/\s/g, '')

    if (!/^\d{16}$/.test(cardDigits)) {
      validationErrors.cardNumber =
        'Enter a 16-digit demo card number.'
    }

    if (
      !/^(0[1-9]|1[0-2])\/\d{2}$/.test(
        expirationDate.trim(),
      )
    ) {
      validationErrors.expirationDate =
        'Enter an expiration date in MM/YY format.'
    }

    if (!/^\d{3,4}$/.test(cvv.trim())) {
      validationErrors.cvv =
        'Enter a 3 or 4 digit demo CVV.'
    }

    setErrors(validationErrors)

    return Object.keys(validationErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setOrderError('')

    if (!validateForm()) {
      return
    }

    if (!user) {
      setOrderError(
        'Please log in before placing an order.',
      )
      return
    }

    setSubmitting(true)

    const { order, error } = await createOrder({
      user,
      items,
      itemCount,
      subtotalCents,
      discountCents,
      taxCents,
      totalCents,
      promotionCode:
        appliedPromotion?.code ?? null,
      fulfillmentMethod,
      customerName,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
    })

    if (error) {
      setOrderError(
        `Unable to place order: ${error.message}`,
      )
      setSubmitting(false)
      return
    }

    setCompletedOrder({
      orderId: order.id,
      itemCount,
      totalCents,
      fulfillmentMethod,
    })

    clearCart()
    setSubmitting(false)

    // Clear simulated payment data from component state
    // after the order has been successfully created.
    setCardName('')
    setCardNumber('')
    setExpirationDate('')
    setCvv('')
  }

  if (completedOrder) {
    return (
      <section>
        <h2>Test Order Confirmed</h2>

        <p role="status">
          Your demonstration order for{' '}
          {completedOrder.itemCount}{' '}
          {completedOrder.itemCount === 1
            ? 'item'
            : 'items'}{' '}
          was successfully created.
        </p>

        <p>
          <strong>Order ID:</strong>{' '}
          {completedOrder.orderId}
        </p>

        <p>
          <strong>
            Demonstration total:{' '}
            {formatCurrency(
              completedOrder.totalCents,
            )}
          </strong>
        </p>

        <p>
          <strong>Fulfillment method:</strong>{' '}
          {completedOrder.fulfillmentMethod ===
          'delivery'
            ? 'Delivery'
            : 'In-Store Pickup'}
        </p>

        <p>
          <strong>Payment:</strong>{' '}
          Demonstration card validation completed
        </p>

        <p>
          No real payment was processed. Card number,
          expiration date, and CVV were not stored with
          the order.
        </p>

        <Link to="/account">
          View My Account
        </Link>

        {' | '}

        <Link to="/menu">
          Return to menu
        </Link>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section>
        <h2>Checkout</h2>

        <p>Your cart is empty.</p>

        <Link to="/menu">
          Browse the menu
        </Link>
      </section>
    )
  }

  return (
    <section className="checkout-page">
      <h2>Checkout</h2>

      <p role="note">
        <strong>
          School project demonstration:
        </strong>{' '}
        No real payment is processed. Use demonstration
        information only. Do not enter real or sensitive
        payment information.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend>Fulfillment Method</legend>

          <label>
            <input
              type="radio"
              name="fulfillment-method"
              value="pickup"
              checked={
                fulfillmentMethod === 'pickup'
              }
              onChange={(event) =>
                setFulfillmentMethod(
                  event.target.value,
                )
              }
            />
            In-Store Pickup
          </label>

          <label>
            <input
              type="radio"
              name="fulfillment-method"
              value="delivery"
              checked={
                fulfillmentMethod === 'delivery'
              }
              onChange={(event) =>
                setFulfillmentMethod(
                  event.target.value,
                )
              }
            />
            Delivery
          </label>
        </fieldset>

        <fieldset>
          <legend>Contact Information</legend>

          <label htmlFor="customer-name">
            Name
          </label>

          <input
            id="customer-name"
            type="text"
            value={customerName}
            maxLength="100"
            aria-describedby={
              errors.customerName
                ? 'customer-name-error'
                : undefined
            }
            aria-invalid={Boolean(
              errors.customerName,
            )}
            onChange={(event) =>
              setCustomerName(
                event.target.value,
              )
            }
          />

          {errors.customerName && (
            <p
              id="customer-name-error"
              role="alert"
            >
              {errors.customerName}
            </p>
          )}

          <label htmlFor="phone">
            Phone
          </label>

          <input
            id="phone"
            type="tel"
            value={phone}
            maxLength="20"
            aria-describedby={
              errors.phone
                ? 'phone-error'
                : undefined
            }
            aria-invalid={Boolean(errors.phone)}
            onChange={(event) =>
              setPhone(event.target.value)
            }
          />

          {errors.phone && (
            <p
              id="phone-error"
              role="alert"
            >
              {errors.phone}
            </p>
          )}
        </fieldset>

        {fulfillmentMethod === 'delivery' && (
          <fieldset>
            <legend>Delivery Address</legend>

            <label htmlFor="street-address">
              Street Address
            </label>

            <input
              id="street-address"
              type="text"
              value={streetAddress}
              maxLength="150"
              aria-invalid={Boolean(
                errors.streetAddress,
              )}
              onChange={(event) =>
                setStreetAddress(
                  event.target.value,
                )
              }
            />

            {errors.streetAddress && (
              <p role="alert">
                {errors.streetAddress}
              </p>
            )}

            <label htmlFor="city">
              City
            </label>

            <input
              id="city"
              type="text"
              value={city}
              maxLength="100"
              aria-invalid={Boolean(errors.city)}
              onChange={(event) =>
                setCity(event.target.value)
              }
            />

            {errors.city && (
              <p role="alert">
                {errors.city}
              </p>
            )}

            <label htmlFor="state">
              State
            </label>

            <input
              id="state"
              type="text"
              value={state}
              maxLength="2"
              aria-invalid={Boolean(errors.state)}
              onChange={(event) =>
                setState(
                  event.target.value.toUpperCase(),
                )
              }
            />

            {errors.state && (
              <p role="alert">
                {errors.state}
              </p>
            )}

            <label htmlFor="zip-code">
              ZIP Code
            </label>

            <input
              id="zip-code"
              type="text"
              inputMode="numeric"
              value={zipCode}
              maxLength="10"
              aria-invalid={Boolean(
                errors.zipCode,
              )}
              onChange={(event) =>
                setZipCode(
                  event.target.value,
                )
              }
            />

            {errors.zipCode && (
              <p role="alert">
                {errors.zipCode}
              </p>
            )}
          </fieldset>
        )}

        <fieldset>
          <legend>
            Demo Payment Information
          </legend>

          <p>
            Use demonstration information only.
            Payment fields are validated locally and
            are not sent to Supabase or stored with
            your order.
          </p>

          <label htmlFor="card-name">
            Name on Card
          </label>

          <input
            id="card-name"
            type="text"
            value={cardName}
            maxLength="100"
            autoComplete="off"
            aria-invalid={Boolean(errors.cardName)}
            onChange={(event) =>
              setCardName(event.target.value)
            }
          />

          {errors.cardName && (
            <p role="alert">
              {errors.cardName}
            </p>
          )}

          <label htmlFor="card-number">
            Card Number
          </label>

          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            value={cardNumber}
            maxLength="19"
            autoComplete="off"
            placeholder="4242 4242 4242 4242"
            aria-invalid={Boolean(
              errors.cardNumber,
            )}
            onChange={(event) =>
              setCardNumber(event.target.value)
            }
          />

          {errors.cardNumber && (
            <p role="alert">
              {errors.cardNumber}
            </p>
          )}

          <label htmlFor="expiration-date">
            Expiration Date
          </label>

          <input
            id="expiration-date"
            type="text"
            inputMode="numeric"
            value={expirationDate}
            maxLength="5"
            autoComplete="off"
            placeholder="MM/YY"
            aria-invalid={Boolean(
              errors.expirationDate,
            )}
            onChange={(event) =>
              setExpirationDate(
                event.target.value,
              )
            }
          />

          {errors.expirationDate && (
            <p role="alert">
              {errors.expirationDate}
            </p>
          )}

          <label htmlFor="cvv">
            CVV
          </label>

          <input
            id="cvv"
            type="password"
            inputMode="numeric"
            value={cvv}
            maxLength="4"
            autoComplete="off"
            placeholder="123"
            aria-invalid={Boolean(errors.cvv)}
            onChange={(event) =>
              setCvv(event.target.value)
            }
          />

          {errors.cvv && (
            <p role="alert">
              {errors.cvv}
            </p>
          )}
        </fieldset>

        <section className="checkout-summary">
          <h3>Order Summary</h3>

          <p>
            Items: {itemCount}
          </p>

          <p>
            Subtotal:{' '}
            {formatCurrency(subtotalCents)}
          </p>

          {appliedPromotion &&
            discountCents > 0 && (
              <>
                <p>
                  Promotion:{' '}
                  {appliedPromotion.code}
                </p>

                <p>
                  Discount: −
                  {formatCurrency(
                    discountCents,
                  )}
                </p>
              </>
            )}

          <p>
            Estimated tax:{' '}
            {formatCurrency(taxCents)}
          </p>

          <p>
            <strong>
              Total:{' '}
              {formatCurrency(totalCents)}
            </strong>
          </p>
        </section>

        {orderError && (
          <p role="alert">
            {orderError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? 'Placing order...'
            : 'Place test order'}
        </button>
      </form>
    </section>
  )
}

export default CheckoutPage