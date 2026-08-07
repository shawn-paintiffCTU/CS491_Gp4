import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserOrders } from '../services/orderService'
import {
  getUserProfile,
  saveUserProfile,
} from '../services/profileService'

function AccountPage() {
  const { user, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState('customer')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
  if (!user) {
    setProfileLoading(false)
    setOrdersLoading(false)
    return
  }

  async function loadAccountData() {
    setProfileLoading(true)
    setOrdersLoading(true)
    setErrorMessage('')

    const {
      profile: loadedProfile,
      role: loadedRole,
      error: profileError,
    } = await getUserProfile(user.id)

    if (profileError) {
      setErrorMessage(
        `Unable to load profile: ${profileError.message}`,
      )
    }

    setProfile(loadedProfile)
    setRole(loadedRole)
    setFullName(loadedProfile?.full_name ?? '')
    setPhone(loadedProfile?.phone ?? '')
    setProfileLoading(false)

    const {
      orders: loadedOrders,
      error: ordersError,
    } = await getUserOrders(user.id)

    if (ordersError) {
      setErrorMessage(
        `Unable to load orders: ${ordersError.message}`,
      )
    }

    setOrders(loadedOrders)
    setOrdersLoading(false)
  }

  loadAccountData()
}, [user])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    if (fullName.trim().length > 100) {
      setErrorMessage(
        'Full name must be 100 characters or fewer.',
      )
      return
    }

    if (
      phone.trim() &&
      !/^[0-9()+\-\s]{7,20}$/.test(phone.trim())
    ) {
      setErrorMessage('Enter a valid phone number.')
      return
    }

    setSaving(true)

    const {
      profile: savedProfile,
      error,
    } = await saveUserProfile(user.id, {
      fullName,
      phone,
    })

    if (error) {
      setErrorMessage(
        `Unable to save profile: ${error.message}`,
      )
      setSaving(false)
      return
    }

    setProfile(savedProfile)
    setFullName(savedProfile?.full_name ?? '')
    setPhone(savedProfile?.phone ?? '')
    setMessage('Profile updated successfully.')
    setSaving(false)
  }

  if (authLoading) {
    return (
      <section>
        <h2>My Account</h2>
        <p>Loading account...</p>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profileLoading) {
    return (
      <section>
        <h2>My Account</h2>
        <p>Loading profile...</p>
      </section>
    )
  }

  return (
  <section className="account-page">
    <h2>
      Welcome back,{' '}
      {profile?.full_name?.trim() || user.email}!
    </h2>

    <h3>My Account</h3>

      {message && <p role="status">{message}</p>}
      {errorMessage && <p role="alert">{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="account-email">Email</label>
          <input
            id="account-email"
            type="email"
            value={user.email ?? ''}
            disabled
          />
        </div>

        <div>
          <label htmlFor="full-name">Full name</label>
          <input
            id="full-name"
            type="text"
            value={fullName}
            maxLength="100"
            onChange={(event) =>
              setFullName(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="account-phone">Phone</label>
          <input
            id="account-phone"
            type="tel"
            value={phone}
            maxLength="20"
            onChange={(event) =>
              setPhone(event.target.value)
            }
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <section>
        <h3>Account Details</h3>

        <dl>
          <div>
            <dt>Role</dt>
            <dd>{role}</dd>
          </div>

          <div>
            <dt>Account created</dt>
            <dd>
              {profile?.created_at
                ? new Date(
                  profile.created_at,
                ).toLocaleString()
                : 'Not available'}
            </dd>
          </div>
        </dl>
      </section>
      <section className="order-history">
  <h3>Recent Orders</h3>

  {ordersLoading ? (
    <p>Loading orders...</p>
  ) : orders.length === 0 ? (
    <>
      <p>No orders have been placed yet.</p>

      <button
        type="button"
        onClick={() => (window.location.href = '/menu')}
      >
        Order a Pizza
      </button>
    </>
  ) : (
    <>
      {orders.map((order) => (
        <article key={order.id} className="order-card">
          <h4>Order #{order.id}</h4>

          <p>
            <strong>Date:</strong>{' '}
            {new Date(order.created_at).toLocaleString()}
          </p>

          <p>
  <strong>Status:</strong>{' '}
  <span className={`order-status order-status-${order.status}`}>
    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
  </span>
</p>

          <p>
            <strong>Total:</strong> $
            {(order.total_cents / 100).toFixed(2)}
          </p>

          <p>
            <strong>Items:</strong>
          </p>

          <ul>
  {order.order_items.map((item) => (
    <li key={item.id}>
      <strong>
        {item.quantity} × {item.item_name}
      </strong>

      {item.size_name && (
        <span> — {item.size_name}</span>
      )}

      {item.crust_name && (
        <span>, {item.crust_name}</span>
      )}

      {Array.isArray(item.toppings) &&
        item.toppings.length > 0 && (
          <div>
            Toppings:{' '}
            {item.toppings
              .map((topping) => topping.name ?? topping)
              .join(', ')}
          </div>
        )}
    </li>
  ))}
</ul>
        </article>
      ))}

      <button
        type="button"
        onClick={() => (window.location.href = '/menu')}
      >
        Order Again
      </button>
    </>
  )}
</section>
    </section>
  )
}

export default AccountPage