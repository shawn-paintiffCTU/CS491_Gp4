import { useEffect, useState } from 'react'
import { getRestaurantInformation } from '../services/restaurantService'

function HomePage() {
  const [restaurant, setRestaurant] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const information = await getRestaurantInformation()
        setRestaurant(information)
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