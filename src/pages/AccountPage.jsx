import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../services/orderService";
import { formatCurrency } from "../utils/pricing";
import {
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  validateContactInformation,
} from "../utils/contactValidation";

function AccountPage() {
  const {
    user,
    profile,
    role,
    paymentMethod,
    loading: authLoading,
    updateProfile,
    deletePaymentMethod,
  } = useAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingPaymentMethod, setRemovingPaymentMethod] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let isActive = true;

    async function loadOrders() {
      const { orders: loadedOrders, error } = await getUserOrders(user.id);

      if (!isActive) {
        return;
      }

      if (error) {
        setErrorMessage(`Unable to load orders: ${error.message}`);
        setOrders([]);
      } else {
        setOrders(loadedOrders);
      }

      setOrdersLoading(false);
    }

    loadOrders();

    return () => {
      isActive = false;
    };
  }, [user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    const validation = validateContactInformation({
      fullName: formData.get("fullName")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
    });

    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setSaving(true);

    const { error } = await updateProfile(validation.values);

    if (error) {
      setErrorMessage(`Unable to save profile: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Profile updated successfully.");
    setSaving(false);
  }

  async function handleRemovePaymentMethod() {
    setMessage("");
    setErrorMessage("");
    setRemovingPaymentMethod(true);

    const { error } = await deletePaymentMethod();

    if (error) {
      setErrorMessage(`Unable to remove saved card: ${error.message}`);
    } else {
      setMessage("Saved card removed successfully.");
    }

    setRemovingPaymentMethod(false);
  }

  if (authLoading) {
    return (
      <section className="account-section">
        <h2>My Account</h2>
        <p>Loading account...</p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="account-page">
      <h2>Welcome back, {profile?.full_name?.trim() || user.email}!</h2>

      {message && <p role="status">{message}</p>}

      {errorMessage && <p role="alert">{errorMessage}</p>}

      <section className="account-section">
        <h3>Profile Information</h3>

        <form
          key={profile?.updated_at ?? "new-profile"}
          className="account-profile-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="account-field">
            <label htmlFor="account-email">Email</label>

            <input
              id="account-email"
              type="email"
              value={user.email ?? ""}
              disabled
            />
          </div>

          <div className="account-field">
            <label htmlFor="account-full-name">Full name</label>

            <input
              id="account-full-name"
              name="fullName"
              type="text"
              defaultValue={profile?.full_name ?? ""}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="name"
              aria-invalid={Boolean(validationErrors.fullName)}
              aria-describedby={
                validationErrors.fullName
                  ? "account-full-name-error"
                  : undefined
              }
            />

            {validationErrors.fullName && (
              <p id="account-full-name-error" role="alert">
                {validationErrors.fullName}
              </p>
            )}
          </div>

          <div className="account-field">
            <label htmlFor="account-phone">Phone</label>

            <input
              id="account-phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ""}
              maxLength={PHONE_MAX_LENGTH}
              autoComplete="tel"
              aria-invalid={Boolean(validationErrors.phone)}
              aria-describedby={
                validationErrors.phone ? "account-phone-error" : undefined
              }
            />

            {validationErrors.phone && (
              <p id="account-phone-error" role="alert">
                {validationErrors.phone}
              </p>
            )}
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      <section className="account-section">
        <h3>Account Details</h3>

        <dl>
          <div>
            <dt>Role:</dt>
            <dd>{role ?? "customer"}</dd>
          </div>

          <div>
            <dt>Account created:</dt>
            <dd>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleString()
                : "Not available"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="account-section">
        <h3>Saved Payment Method</h3>

        {paymentMethod ? (
          <>
            <p>
              <strong>{paymentMethod.cardBrand}</strong> ending in{" "}
              {paymentMethod.lastFour}
            </p>

            <p>Cardholder: {paymentMethod.cardholderName}</p>

            <p>
              Expires: {String(paymentMethod.expirationMonth).padStart(2, "0")}/
              {String(paymentMethod.expirationYear).slice(-2)}
            </p>

            <p>
              Only the card brand, last four digits, cardholder name, and
              expiration are stored. Full card numbers and security codes are
              never saved.
            </p>

            <button
              type="button"
              disabled={removingPaymentMethod}
              onClick={handleRemovePaymentMethod}
            >
              {removingPaymentMethod ? "Removing..." : "Remove Saved Card"}
            </button>
          </>
        ) : (
          <p>
            No card is saved. You can save safe card metadata during checkout.
          </p>
        )}
      </section>

      <section className="account-section order-history">
        <h3>Recent Orders</h3>

        {ordersLoading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <>
            <p>No orders have been placed yet.</p>
            <Link to="/menu">Order a Pizza</Link>
          </>
        ) : (
          <>
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <h4>Order #{order.id}</h4>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`order-status order-status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </p>

                <p>
                  <strong>Fulfillment:</strong> In-Store Pickup
                </p>

                <p>
                  <strong>Total:</strong> {formatCurrency(order.total_cents)}
                </p>

                <p>
                  <strong>Items:</strong>
                </p>

                <ul>
                  {order.order_items?.map((item) => (
                    <li key={item.id}>
                      <strong>
                        {item.quantity} × {item.item_name}
                      </strong>

                      {item.size_name && <span> — {item.size_name}</span>}

                      {item.crust_name && <span>, {item.crust_name}</span>}

                      {Array.isArray(item.toppings) &&
                        item.toppings.length > 0 && (
                          <div>
                            Toppings:{" "}
                            {item.toppings
                              .map((topping) => topping.name ?? topping)
                              .join(", ")}
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
              </article>
            ))}

            <Link to="/menu">Order Again</Link>
          </>
        )}
      </section>
    </section>
  );
}

export default AccountPage;