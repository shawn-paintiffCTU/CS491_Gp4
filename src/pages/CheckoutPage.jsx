import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { getDeliveryZipCodeDescription, validateDeliveryAddress } from '../services/deliveryService'
import { formatCurrency } from '../utils/formatCurrency'

const TAX_RATE = 0.08

const emptyAddress = {
  street: '',
  city: '',
  state: 'AL',
  zipCode: '',
}

function CheckoutPage() {
  const {
    items,
    itemCount,
    subtotalCents,
    clearCart,
  } = useCart()

  const [fulfillment, setFulfillment] = useState('pickup')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState(emptyAddress)
  const [errors, setErrors] = useState({})
  const zipCodeTooltip = getDeliveryZipCodeDescription()
  const [completedOrder, setCompletedOrder] = useState(null)

  const taxCents = Math.round(subtotalCents * TAX_RATE)
  const totalCents = subtotalCents + taxCents

  function updateAddress(event) {
    const { name, value } = event.target

    setAddress((currentAddress) => ({
      ...currentAddress,
      [name]: value,
    }))
  }

  function validateForm() {
    const validationErrors = {}

    if (customerName.trim().length < 2) {
      validationErrors.customerName = 'Enter your name.'
    }

    if (!/^[0-9()+\-\s]{7,20}$/.test(phone.trim())) {
      validationErrors.phone = 'Enter a valid phone number.'
    }

    if (fulfillment === 'delivery') {
      const deliveryValidation = validateDeliveryAddress(address)

      Object.assign(validationErrors, deliveryValidation.errors)
    }

    setErrors(validationErrors)

    return Object.keys(validationErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setCompletedOrder({
      itemCount,
      totalCents,
      fulfillment,
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
          Fulfillment method:{' '}
          {completedOrder.fulfillment === 'delivery'
            ? 'Delivery'
            : 'Pickup'}
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
        <fieldset>
          <legend>Fulfillment method</legend>

          <label>
            <input
              type="radio"
              name="fulfillment"
              value="pickup"
              checked={fulfillment === 'pickup'}
              onChange={() => setFulfillment('pickup')}
            />
            Pickup
          </label>

          <label>
            <input
              type="radio"
              name="fulfillment"
              value="delivery"
              checked={fulfillment === 'delivery'}
              onChange={() => setFulfillment('delivery')}
            />
            Delivery
          </label>
        </fieldset>

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

        {fulfillment === 'delivery' && (
          <fieldset>
            <legend>Delivery address</legend>

            <label htmlFor="street">Street address</label>
            <input
              id="street"
              name="street"
              type="text"
              value={address.street}
              maxLength="150"
              aria-invalid={Boolean(errors.street)}
              onChange={updateAddress}
            />
            {errors.street && <p role="alert">{errors.street}</p>}

            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              type="text"
              value={address.city}
              maxLength="100"
              aria-invalid={Boolean(errors.city)}
              onChange={updateAddress}
            />
            {errors.city && <p role="alert">{errors.city}</p>}

            <label htmlFor="state">State</label>
            <input
              id="state"
              name="state"
              type="text"
              value={address.state}
              maxLength="2"
              aria-invalid={Boolean(errors.state)}
              onChange={updateAddress}
            />
            {errors.state && <p role="alert">{errors.state}</p>}

            <label htmlFor="zip-code">
              ZIP code{' '}
              <span
                className="field-tooltip"
                role="img"
                tabIndex="0"
                aria-label={zipCodeTooltip}
                title={zipCodeTooltip}
              >
                ⓘ
              </span>
            </label>
            <input
              id="zip-code"
              name="zipCode"
              type="text"
              inputMode="numeric"
              value={address.zipCode}
              maxLength="5"
              aria-invalid={Boolean(errors.zipCode)}
              onChange={updateAddress}
            />
            {errors.zipCode && <p role="alert">{errors.zipCode}</p>}
          </fieldset>
        )}

        <section>
          <h3>Order Summary</h3>
          <p>Items: {itemCount}</p>
          <p>Subtotal: {formatCurrency(subtotalCents)}</p>
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