import { useEffect, useRef, useState } from 'react'

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
      Math.max(intendedX, 130),
      window.innerWidth - 130,
    )

    const y = Math.max(intendedY, 60)

    setNotification({
      message,
      x,
      y,
    })

    timerReference.current = window.setTimeout(() => {
      setNotification(null)
    }, 1000)
  }
  
  return {
    notification,
    showNotification,
  }
}