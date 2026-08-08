// Pickup-only demonstration checkout for guests and signed-in customers.
// Full card numbers and security codes are validated locally and never stored.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/orderService";
import { calculateOrderTotals, formatCurrency } from "../utils/pricing";
import {
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  validateContactInformation,
} from "../utils/contactValidation";
import {
  CARDHOLDER_NAME_MAX_LENGTH,
  paymentMethodIsExpired,
  validatePaymentInformation,
} from "../utils/paymentValidation";

function CheckoutPage() {
  const {
    items,
    itemCount,
    subtotalCents,
    appliedPromotion,
    discountCents,
    clearCart,
  } = useCart();

  const { user, profile, paymentMethod, savePaymentMethod } = useAuth();

  const [paymentChoice, setPaymentChoice] = useState("new");
  const [errors, setErrors] = useState({});
  const [completedOrder, setCompletedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [saveWarning, setSaveWarning] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const { taxCents, totalCents } = calculateOrderTotals(
    subtotalCents,
    discountCents,
  );

  function handleCardNumberChange(event) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits);
  }

  function handleExpirationDateChange(event) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 4);

    if (digits.length > 2) {
      setExpirationDate(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setExpirationDate(digits);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setOrderError("");
    setSaveWarning("");

    const formData = new FormData(event.currentTarget);
    const contactValidation = validateContactInformation({
      fullName: formData.get("fullName")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
    });

    const useSavedPaymentMethod =
      paymentChoice === "saved" && Boolean(paymentMethod);

    const savedPaymentMethodExpired =
      useSavedPaymentMethod && paymentMethodIsExpired(paymentMethod);

    const paymentValidation = useSavedPaymentMethod
      ? {
        isValid: !savedPaymentMethodExpired,
        errors: savedPaymentMethodExpired
          ? {
            paymentChoice: "The saved demonstration card is expired.",
          }
          : {},
        metadata: paymentMethod,
      }
      : validatePaymentInformation({
        cardholderName: formData.get("cardholderName")?.toString() ?? "",
        cardNumber: formData.get("cardNumber")?.toString() ?? "",
        expirationDate: formData.get("expirationDate")?.toString() ?? "",
        securityCode: formData.get("securityCode")?.toString() ?? "",
      });

    setErrors({
      ...contactValidation.errors,
      ...paymentValidation.errors,
    });

    if (!contactValidation.isValid || !paymentValidation.isValid) {
      return;
    }

    setSubmitting(true);

    const { order, error } = await createOrder({
      items,
      itemCount,
      subtotalCents,
      discountCents,
      taxCents,
      totalCents,
      promotionCode: appliedPromotion?.code ?? null,
      customerName: contactValidation.values.fullName,
      phone: contactValidation.values.phone,
      paymentMethod: paymentValidation.metadata,
    });

    if (error) {
      setOrderError(`Unable to place order: ${error.message}`);
      setSubmitting(false);
      return;
    }

    const shouldSaveCard =
      user && !useSavedPaymentMethod && formData.get("saveCard") === "yes";

    if (shouldSaveCard) {
      const { error: saveError } = await savePaymentMethod(
        paymentValidation.metadata,
      );

      if (saveError) {
        setSaveWarning(
          `The order was placed, but the card could not be saved: ${saveError.message}`,
        );
      }
    }

    setCompletedOrder({
      orderId: order.id,
      itemCount,
      totalCents,
      paymentMethod: paymentValidation.metadata,
    });

    clearCart();
    setSubmitting(false);
  }

  if (completedOrder) {
    return (
      <section>
        <h2>Test Order Confirmed</h2>

        <p role="status">
          Your demonstration order for {completedOrder.itemCount}{" "}
          {completedOrder.itemCount === 1 ? "item" : "items"} was successfully
          created.
        </p>

        <p>
          <strong>Order ID:</strong> {completedOrder.orderId}
        </p>

        <p>
          <strong>Demonstration total:</strong>{" "}
          {formatCurrency(completedOrder.totalCents)}
        </p>

        <p>
          <strong>Fulfillment method:</strong> In-Store Pickup
        </p>

        <p>
          <strong>Payment:</strong> {completedOrder.paymentMethod.cardBrand}{" "}
          ending in {completedOrder.paymentMethod.lastFour}
        </p>

        <p>
          No real payment was processed. The full card number and security code
          were not transmitted to Supabase or stored.
        </p>

        {saveWarning && <p role="alert">{saveWarning}</p>}

        {user && (
          <>
            <Link to="/account">View My Account</Link>
            {" | "}
          </>
        )}

        <Link to="/menu">Return to menu</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section>
        <h2>Checkout</h2>
        <p>Your cart is empty.</p>
        <Link to="/menu">Browse the menu</Link>
      </section>
    );
  }

  const hasSavedPaymentMethod = Boolean(user && paymentMethod);
  const useSavedPaymentMethod =
    paymentChoice === "saved" && hasSavedPaymentMethod;

  return (
    <section className="checkout-page">
      <h2>Checkout</h2>

      <p role="note">
        <strong>School project demonstration:</strong> No real payment is
        processed. Use demonstration information only.
      </p>

      {!user && (
        <p>
          You are checking out as a guest. You may place this order without
          creating an account, but it will not appear in an account order
          history.
        </p>
      )}

      <form
        key={profile?.updated_at ?? user?.id ?? "guest-checkout"}
        onSubmit={handleSubmit}
        noValidate
      >
        <section className="pickup-notice">
          <h3>Pickup Order</h3>
          <p>All online orders are picked up at the restaurant.</p>
        </section>

        <fieldset>
          <legend>Contact Information</legend>

          <label htmlFor="customer-name">Name</label>
          <input
            id="customer-name"
            name="fullName"
            type="text"
            defaultValue={profile?.full_name ?? ""}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={
              errors.fullName ? "customer-name-error" : undefined
            }
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
            defaultValue={profile?.phone ?? ""}
            maxLength={PHONE_MAX_LENGTH}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />

          {errors.phone && (
            <p id="phone-error" role="alert">
              {errors.phone}
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend>Demo Payment Information</legend>

          <p>
            Full card numbers and security codes are checked only in this
            browser and are never saved.
          </p>

          {hasSavedPaymentMethod && (
            <>
              <label>
                <input
                  type="radio"
                  name="payment-choice"
                  value="saved"
                  checked={paymentChoice === "saved"}
                  onChange={() => setPaymentChoice("saved")}
                />
                Use saved {paymentMethod.cardBrand} ending in{" "}
                {paymentMethod.lastFour}
              </label>

              <label>
                <input
                  type="radio"
                  name="payment-choice"
                  value="new"
                  checked={paymentChoice === "new"}
                  onChange={() => setPaymentChoice("new")}
                />
                Enter a new demonstration card
              </label>
            </>
          )}

          {errors.paymentChoice && <p role="alert">{errors.paymentChoice}</p>}

          {!useSavedPaymentMethod && (
            <>
              <label htmlFor="cardholder-name">Name on Card</label>
              <input
                id="cardholder-name"
                name="cardholderName"
                type="text"
                defaultValue={profile?.full_name ?? ""}
                maxLength={CARDHOLDER_NAME_MAX_LENGTH}
                autoComplete="off"
                aria-invalid={Boolean(errors.cardholderName)}
              />

              {errors.cardholderName && (
                <p role="alert">{errors.cardholderName}</p>
              )}

              <label htmlFor="card-number">Card Number</label>
              <input
                id="card-number"
                name="cardNumber"
                type="text"
                inputMode="numeric"
                value={cardNumber}
                maxLength="16"
                autoComplete="off"
                placeholder="4242424242424242"
                aria-invalid={Boolean(errors.cardNumber)}
                onChange={handleCardNumberChange}
              />

              {errors.cardNumber && <p role="alert">{errors.cardNumber}</p>}

              <label htmlFor="expiration-date">Expiration Date</label>
              <input
                id="expiration-date"
                name="expirationDate"
                type="text"
                inputMode="numeric"
                value={expirationDate}
                maxLength="5"
                autoComplete="off"
                placeholder="MM/YY"
                aria-invalid={Boolean(errors.expirationDate)}
                onChange={handleExpirationDateChange}
              />

              {errors.expirationDate && (
                <p role="alert">{errors.expirationDate}</p>
              )}

              <label htmlFor="security-code">Security Code</label>
              <input
                id="security-code"
                name="securityCode"
                type="password"
                inputMode="numeric"
                maxLength="4"
                autoComplete="off"
                placeholder="123"
                aria-invalid={Boolean(errors.securityCode)}
              />

              {errors.securityCode && <p role="alert">{errors.securityCode}</p>}

              {user && (
                <label>
                  <input type="checkbox" name="saveCard" value="yes" />
                  Save this card to my account
                </label>
              )}
            </>
          )}
        </fieldset>

        <section className="checkout-summary">
          <h3>Order Summary</h3>
          <p>Items: {itemCount}</p>
          <p>Subtotal: {formatCurrency(subtotalCents)}</p>

          {appliedPromotion && discountCents > 0 && (
            <>
              <p>Promotion: {appliedPromotion.code}</p>
              <p>Discount: −{formatCurrency(discountCents)}</p>
            </>
          )}

          <p>Estimated tax: {formatCurrency(taxCents)}</p>
          <p>
            <strong>Total: {formatCurrency(totalCents)}</strong>
          </p>
        </section>

        {orderError && <p role="alert">{orderError}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Placing order..." : "Place test order"}
        </button>
      </form>
    </section>
  );
}

export default CheckoutPage;
