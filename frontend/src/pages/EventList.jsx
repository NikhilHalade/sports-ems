import { getRole } from "../utils/auth";
import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import eventService from '../services/eventService'
import Alert from '../components/Alert'
import Loader from '../components/Loader'
import ConfirmModal from '../components/ConfirmModal'
import StatusBadge from '../components/StatusBadge'

function formatDate(isoDate) {
  if (!isoDate) return '—'
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatTime(hhmm) {
  if (!hhmm) return '—'
  const [h, m] = hhmm.split(':')
  const date = new Date()
  date.setHours(Number(h), Number(m))
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function formatFee(fee) {
  if (fee === null || fee === undefined) return '—'
  return `₹${Number(fee).toFixed(2)}`
}

function EventList() {
  const location = useLocation()
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadEvents = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const role = getRole()
      const data = role === "ADMIN" ? await eventService.getAllEvents() : await eventService.getMyEvents()
      setEvents(data)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
    // Clear any "success" state passed via navigation so it doesn't reappear on refresh
    if (location.state?.successMessage) {
      navigate(location.pathname, { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleDeleteClick(event) {
    setDeleteTarget(event)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await eventService.deleteEvent(deleteTarget.eventId)
      setSuccessMessage(`"${deleteTarget.eventName}" was deleted successfully.`)
      setDeleteTarget(null)
      await loadEvents()
    } catch (err) {
      setErrorMessage(err.message)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const stats = {
    total: events.length,
    open: events.filter((e) => e.status === 'OPEN').length,
    closed: events.filter((e) => e.status === 'CLOSED').length,
    cancelled: events.filter((e) => e.status === 'CANCELLED').length,
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Event Roster</h1>
          <p className="page-header__subtitle">
            Create, review, and manage every sports event on the calendar.
          </p>
        </div>
        <Link to="/events/create" className="btn btn--primary">
          + Create Event
        </Link>
      </div>

      <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />

      {!isLoading && events.length > 0 && (
        <div className="stat-strip">
          <div className="stat-cell">
            <div className="stat-cell__value">{stats.total}</div>
            <div className="stat-cell__label">Total Events</div>
          </div>
          <div className="stat-cell">
            <div className="stat-cell__value">{stats.open}</div>
            <div className="stat-cell__label">Open</div>
          </div>
          <div className="stat-cell">
            <div className="stat-cell__value">{stats.closed}</div>
            <div className="stat-cell__label">Closed</div>
          </div>
          <div className="stat-cell">
            <div className="stat-cell__value">{stats.cancelled}</div>
            <div className="stat-cell__label">Cancelled</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <Loader label="Loading events…" />
      ) : events.length === 0 ? (
        <div className="table-wrapper">
          <div className="empty-state">
            <h3>No events yet</h3>
            <p>Get the calendar started by creating your first sports event.</p>
            <Link to="/events/create" className="btn btn--primary">
              + Create Event
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="event-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Time</th>
                <th>Fee</th>
                <th>Capacity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.eventId}>
                  <td className="event-table__name">{event.eventName}</td>
                  <td>{event.venue}</td>
                  <td>{formatDate(event.eventDate)}</td>
                  <td className="event-table__muted">
                    {formatTime(event.startTime)} – {formatTime(event.endTime)}
                  </td>
                  <td className="event-table__numeric">{formatFee(event.registrationFee)}</td>
                  <td className="event-table__numeric">
                    {event.maxParticipants ?? '—'}
                  </td>
                  <td>
                    <StatusBadge status={event.status} />
                  </td>
                  <td>
                    <div className="event-table__actions">
                      <Link
                        to={`/events/edit/${event.eventId}`}
                        className="btn btn--secondary btn--sm"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => handleDeleteClick(event)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this event?"
        message={
          deleteTarget
            ? `This will permanently remove "${deleteTarget.eventName}" from the roster. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Event"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default EventList
