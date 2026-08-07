import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProfile } from '../services/profileService'
import {
  getAllOrders,
  updateOrderStatus,
} from '../services/orderService'

function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth()

  const [role, setRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    if (!user) {
      setRoleLoading(false)
      setOrdersLoading(false)
      return
    }

    async function loadAdminData() {
      setRoleLoading(true)
      setOrdersLoading(true)
      setErrorMessage('')

      const {
        role: loadedRole,
        error: roleError,
      } = await getUserProfile(user.id)

      if (roleError) {
        setErrorMessage(
          `Unable to verify admin access: ${roleError.message}`,
        )
      }

      const normalizedRole = loadedRole?.trim().toLowerCase()

setRole(normalizedRole)
setRoleLoading(false)

if (normalizedRole !== 'admin') {
  setOrdersLoading(false)
  return
}

      const {
        orders: loadedOrders,
        error: ordersError,
      } = await getAllOrders()

      if (ordersError) {
        setErrorMessage(
          `Unable to load orders: ${ordersError.message}`,
        )
      }

      setOrders(loadedOrders)
      setOrdersLoading(false)
    }

    loadAdminData()
  }, [user])

  if (authLoading || roleLoading) {
    return (
      <section>
        <h2>Admin Order Dashboard</h2>
        <p>Checking access...</p>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role !== 'admin') {
  return (
    <section>
      <h2>Admin Debug</h2>

      <p>
        User Email: {user?.email}
      </p>

      <p>
        Role: "{String(role)}"
      </p>

      <p>
        You are not authorized to access the admin dashboard.
      </p>
    </section>
  )
}

async function handleStatusChange(orderId, newStatus) {
  setUpdatingOrderId(orderId)
  setErrorMessage('')

  const { order: updatedOrder, error } =
    await updateOrderStatus(orderId, newStatus)

  if (error) {
    setErrorMessage(
      `Unable to update order: ${error.message}`,
    )
    setUpdatingOrderId(null)
    return
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
  )

  setUpdatingOrderId(null)
}
  return (
    <section>
      <h2>Admin Order Dashboard</h2>

      {errorMessage && (
        <p role="alert">{errorMessage}</p>
      )}

      {ordersLoading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No customer orders have been placed yet.</p>
      ) : (
        <div>
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <h3>Order #{order.id}</h3>

              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={`order-status order-status-${order.status}`}
                >
                  {order.status.charAt(0).toUpperCase() +
                    order.status.slice(1)}
                </span>
              </p>

              <div className="admin-order-actions">
  <button
    type="button"
    disabled={
      updatingOrderId === order.id ||
      order.status === 'preparing'
    }
    onClick={() =>
      handleStatusChange(order.id, 'preparing')
    }
  >
    Preparing
  </button>

  <button
    type="button"
    disabled={
      updatingOrderId === order.id ||
      order.status === 'ready'
    }
    onClick={() =>
      handleStatusChange(order.id, 'ready')
    }
  >
    Ready
  </button>

  <button
    type="button"
    disabled={
      updatingOrderId === order.id ||
      order.status === 'completed'
    }
    onClick={() =>
      handleStatusChange(order.id, 'completed')
    }
  >
    Completed
  </button>

  <button
    type="button"
    disabled={
      updatingOrderId === order.id ||
      order.status === 'cancelled'
    }
    onClick={() =>
      handleStatusChange(order.id, 'cancelled')
    }
  >
    Cancel
  </button>
</div>

              <p>
                <strong>Date:</strong>{' '}
                {new Date(order.created_at).toLocaleString()}
              </p>

              <p>
                <strong>Items:</strong> {order.item_count}
              </p>

              <ul>
                {order.order_items?.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.item_name}
                  </li>
                ))}
              </ul>

              <p>
                <strong>Total:</strong>{' '}
                ${(order.total_cents / 100).toFixed(2)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdminOrdersPage