// Displays short cart feedback near the button that the customer clicked.
function FloatingNotification({ notification }) {
  if (!notification) {
    return null
  }

  return (
    <div
      className="floating-notification"
      role="status"
      aria-live="polite"
      style={{
        left: `${notification.x}px`,
        top: `${notification.y}px`,
      }}
    >
      ✓ {notification.message}
    </div>
  )
}

export default FloatingNotification
