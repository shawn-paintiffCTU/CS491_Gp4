// Provides one-second, cursor-adjacent feedback after an item is added.
import { useEffect, useRef, useState } from 'react'

const NOTIFICATION_DURATION_MS = 1000
const HORIZONTAL_MARGIN = 130
const MINIMUM_TOP_POSITION = 60

export function useFloatingNotification() {
  const [notification, setNotification] = useState(null)
  const timerReference = useRef(null)

  useEffect(() => {
    return () => {
      window.clearTimeout(timerReference.current)
    }
  }, [])

  function showNotification(message, event) {
    window.clearTimeout(timerReference.current)

    // Use the triggering button as the anchor, with screen-center fallbacks.
    const buttonRectangle =
      event?.currentTarget?.getBoundingClientRect()

    const fallbackX = window.innerWidth / 2
    const fallbackY = window.innerHeight / 2

    const intendedX = buttonRectangle
      ? buttonRectangle.left + buttonRectangle.width / 2
      : fallbackX

    const intendedY = buttonRectangle
      ? buttonRectangle.top - 10
      : fallbackY

    const x = Math.min(
      Math.max(intendedX, HORIZONTAL_MARGIN),
      window.innerWidth - HORIZONTAL_MARGIN,
    )

    const y = Math.max(intendedY, MINIMUM_TOP_POSITION)

    setNotification({
      message,
      x,
      y,
    })

    timerReference.current = window.setTimeout(() => {
      setNotification(null)
    }, NOTIFICATION_DURATION_MS)
  }

  return {
    notification,
    showNotification,
  }
}
