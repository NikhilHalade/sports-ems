/**
 * Confirmation dialog. Renders nothing when isOpen is false.
 * @param {{
 *   isOpen: boolean,
 *   title: string,
 *   message: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   isProcessing?: boolean,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isProcessing = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title">{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn--danger-solid"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
