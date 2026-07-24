function FloatingNotification({ notification }) {
  if (!notification) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        zIndex: 2147483647,
        left: `${notification.x}px`,
        top: `${notification.y}px`,
        transform: 'translate(-50%, -100%)',
        width: 'max-content',
        maxWidth: 'min(280px, calc(100vw - 24px))',
        padding: '10px 14px',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: 1.3,
        textAlign: 'center',
        backgroundColor: '#176b32',
        border: '2px solid #70d58a',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        pointerEvents: 'none',
      }}
    >
      {notification.message}
    </div>
  )
}

export default FloatingNotification