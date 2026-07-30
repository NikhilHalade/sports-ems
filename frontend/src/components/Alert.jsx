/**
 * Dismissible banner used to show success or error messages.
 * @param {{type: 'success'|'error', message: string, onClose?: () => void}} props
 */
function Alert({ type = 'success', message, onClose }) {
  if (!message) return null

  return (
    <div className={`alert alert--${type}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          className="alert__close"
          onClick={onClose}
          aria-label="Dismiss message"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default Alert
