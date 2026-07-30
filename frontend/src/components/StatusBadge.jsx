const STATUS_LABELS = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
}

/**
 * Colored pill showing an event's status.
 * @param {{status: 'OPEN'|'CLOSED'|'CANCELLED'}} props
 */
function StatusBadge({ status }) {
  const className = `badge badge--${(status || '').toLowerCase()}`
  return <span className={className}>{STATUS_LABELS[status] || status}</span>
}

export default StatusBadge
