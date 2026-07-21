import { useEffect, useState } from 'react'
import { getRestaurantInformation } from '../services/restaurantService'
import { Link } from 'react-router-dom'
import { getActivePromotions } from '../services/promotionService'
import { formatCurrency } from '../utils/formatCurrency'
import PhotoGallery from '../components/PhotoGallery'

function HomePage() {
  const [restaurant, setRestaurant] = useState(null)
  const [error, setError] = useState('')
  const [promotions, setPromotions] = useState([])

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const [information, activePromotions] = await Promise.all([
          getRestaurantInformation(),
          getActivePromotions(),
        ])

        setRestaurant(information)
        setPromotions(activePromotions)
      } catch {
        setError('Restaurant information could not be loaded.')
      }
    }

    loadRestaurant()
  }, [])

  if (error) {
    return <p role="alert">{error}</p>
  }

  if (!restaurant) {
    return <p>Loading restaurant information...</p>
  }

  return (
    <>
      <section>
        <p>Welcome to</p>
        <h2>{restaurant.name}</h2>
        <p>{restaurant.tagline}</p>
        <p>{restaurant.description}</p>
      </section>

      {promotions.length > 0 && (
        <section className="specials-section">
          <h2>Current Specials</h2>
          <p>Use these promotion codes when reviewing your cart.</p>

          <div className="specials-grid">
            {promotions.map((promotion) => (
              <article key={promotion.id} className="special-card">
                <h3>{promotion.code}</h3>
                <p>{promotion.description}</p>
                <p>
                  Minimum order:{' '}
                  {formatCurrency(promotion.minimumSubtotalCents)}
                </p>
              </article>
            ))}
          </div>

          <Link to="/menu">Start an order</Link>
        </section>
      )}

      <PhotoGallery />

      <section>
        <h2>Visit Us</h2>

        <address>
          {restaurant.address.street}
          <br />
          {restaurant.address.city}, {restaurant.address.state}{' '}
          {restaurant.address.zipCode}
        </address>

        <p>
          Phone: <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
        </p>

        <p>
          Email: <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
        </p>
      </section>

      <section>
        <h2>Restaurant Hours</h2>

        <ul>
          {restaurant.hours.map((schedule) => (
            <li key={schedule.days}>
              <strong>{schedule.days}:</strong> {schedule.time}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default HomePage