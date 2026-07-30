import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import eventService from '../services/eventService'
import EventForm from '../components/EventForm'
import Alert from '../components/Alert'

function CreateEvent() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(payload) {
    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const created = await eventService.createEvent(payload)
      navigate('/events/manage', {
        state: { successMessage: `"${created.eventName}" was created successfully.` },
      })
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Create Event</h1>
          <p className="page-header__subtitle">
            Fill in the details below to add a new event to the roster.
          </p>
        </div>
        <Link to="/events/manage" className="btn btn--secondary">
          ← Back to Events
        </Link>
      </div>

      <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />

      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Create Event"
        onCancel={() => navigate('/events/manage')}
      />
    </div>
  )
}

export default CreateEvent
