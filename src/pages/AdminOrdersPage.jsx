import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllOrders, updateOrderStatus } from "../services/orderService";

function AdminOrdersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      return undefined;
    }

    let isActive = true;

    async function loadOrders() {
      const { orders: loadedOrders, error } = await getAllOrders();

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
  }, [user, isAdmin]);

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingOrderId(orderId);
    setErrorMessage("");

    const { order: updatedOrder, error } = await updateOrderStatus(
      orderId,
      newStatus,
    );

    if (error) {
      setErrorMessage(`Unable to update order: ${error.message}`);
      setUpdatingOrderId(null);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: updatedOrder.status,
            }
          : order,
      ),
    );

    setUpdatingOrderId(null);
  }

  if (authLoading) {
    return (
      <section>
        <h2>Admin Order Dashboard</h2>
        <p>Checking access...</p>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return (
    <section className="admin-orders-page">
      <h2>Admin Order Dashboard</h2>

      <p>Review customer orders and update their current status.</p>

      {errorMessage && <p role="alert">{errorMessage}</p>}

      {ordersLoading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No customer orders have been placed yet.</p>
      ) : (
        <div className="admin-order-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <h3>Order #{order.id}</h3>

              <section className="admin-customer-details">
                <h4>Customer Information</h4>

                <p>
                  <strong>Customer:</strong>{" "}
                  {order.customer_name ||
                    order.customer?.full_name ||
                    "Name not provided"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {order.customer_phone ||
                    order.customer?.phone ||
                    "Phone not provided"}
                </p>
              </section>

              <section className="admin-fulfillment-details">
                <h4>Fulfillment</h4>

                <p>
                  <strong>Method:</strong> In-Store Pickup
                </p>

                <p>
                  <strong>Account:</strong>{" "}
                  {order.user_id ? "Registered customer" : "Guest"}
                </p>

                <p>
                  <strong>Payment:</strong> {order.payment_brand || "Card"}{" "}
                  ending in {order.payment_last_four || "unknown"}
                </p>
              </section>

              <section className="admin-status-details">
                <h4>Order Status</h4>

                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`order-status order-status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </p>

                <div className="admin-order-actions">
                  <button
                    type="button"
                    disabled={
                      updatingOrderId === order.id ||
                      order.status === "preparing"
                    }
                    onClick={() => handleStatusChange(order.id, "preparing")}
                  >
                    Preparing
                  </button>

                  <button
                    type="button"
                    disabled={
                      updatingOrderId === order.id || order.status === "ready"
                    }
                    onClick={() => handleStatusChange(order.id, "ready")}
                  >
                    Ready
                  </button>

                  <button
                    type="button"
                    disabled={
                      updatingOrderId === order.id ||
                      order.status === "completed"
                    }
                    onClick={() => handleStatusChange(order.id, "completed")}
                  >
                    Completed
                  </button>

                  <button
                    type="button"
                    disabled={
                      updatingOrderId === order.id ||
                      order.status === "cancelled"
                    }
                    onClick={() => handleStatusChange(order.id, "cancelled")}
                  >
                    Cancel
                  </button>
                </div>
              </section>

              <section className="admin-order-details">
                <h4>Order Details</h4>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>

                <p>
                  <strong>Items:</strong> {order.item_count}
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

                {order.promotion_code && (
                  <p>
                    <strong>Promotion:</strong> {order.promotion_code}
                  </p>
                )}

                {order.discount_cents > 0 && (
                  <p>
                    <strong>Discount:</strong> −$
                    {(order.discount_cents / 100).toFixed(2)}
                  </p>
                )}

                <p>
                  <strong>Total:</strong> $
                  {(order.total_cents / 100).toFixed(2)}
                </p>
              </section>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminOrdersPage;
