import { useState } from 'react'

const EMPTY_EVENT = {
  eventName: '',
  description: '',
  venue: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  maxParticipants: '',
  registrationFee: '',
  status: 'OPEN',
}

/**
 * Validates the form values and returns a { field: message } error map.
 */
function validate(values) {
  const errors = {}

  if (!values.eventName.trim()) {
    errors.eventName = 'Event name is required.'
  } else if (values.eventName.length > 150) {
    errors.eventName = 'Event name must not exceed 150 characters.'
  }

  if (!values.venue.trim()) {
    errors.venue = 'Venue is required.'
  } else if (values.venue.length > 200) {
    errors.venue = 'Venue must not exceed 200 characters.'
  }

  if (!values.eventDate) {
    errors.eventDate = 'Event date is required.'
  }

  if (values.startTime && values.endTime && values.endTime <= values.startTime) {
    errors.endTime = 'End time must be after start time.'
  }

  if (values.maxParticipants !== '' && Number(values.maxParticipants) <= 0) {
    errors.maxParticipants = 'Maximum participants must be a positive number.'
  }

  if (values.registrationFee !== '' && Number(values.registrationFee) < 0) {
    errors.registrationFee = 'Registration fee cannot be negative.'
  }

  return errors
}

/**
 * Shared Create / Edit event form.
 * @param {{
 *   initialValues?: object,
 *   onSubmit: (payload: object) => Promise<void> | void,
 *   submitLabel?: string,
 *   isSubmitting?: boolean,
 *   onCancel?: () => void,
 *   showStatusField?: boolean,
 * }} props
 */
function EventForm({
  initialValues,
  onSubmit,
  submitLabel = 'Save Event',
  isSubmitting = false,
  onCancel,
  showStatusField = true,
}) {
  const [values, setValues] = useState({ ...EMPTY_EVENT, ...initialValues })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload = {
      eventName: values.eventName.trim(),
      description: values.description.trim() || null,
      venue: values.venue.trim(),
      eventDate: values.eventDate,
      startTime: values.startTime || null,
      endTime: values.endTime || null,
      maxParticipants: values.maxParticipants === '' ? null : Number(values.maxParticipants),
      registrationFee: values.registrationFee === '' ? null : Number(values.registrationFee),
      status: values.status,
    }

    await onSubmit(payload)
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-field form-field--full">
          <label className="form-label" htmlFor="eventName">
            Event Name<span className="required">*</span>
          </label>
          <input
            id="eventName"
            name="eventName"
            type="text"
            className={`form-input ${errors.eventName ? 'form-input--error' : ''}`}
            value={values.eventName}
            onChange={handleChange}
            placeholder="e.g. City Marathon 2026"
            maxLength={150}
          />
          {errors.eventName && <span className="form-error-text">{errors.eventName}</span>}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            value={values.description}
            onChange={handleChange}
            placeholder="Brief details about the event…"
            maxLength={2000}
          />
        </div>

        <div className="form-field form-field--full">
          <label className="form-label" htmlFor="venue">
            Venue<span className="required">*</span>
          </label>
          <input
            id="venue"
            name="venue"
            type="text"
            className={`form-input ${errors.venue ? 'form-input--error' : ''}`}
            value={values.venue}
            onChange={handleChange}
            placeholder="e.g. MG Road, Bengaluru"
            maxLength={200}
          />
          {errors.venue && <span className="form-error-text">{errors.venue}</span>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="eventDate">
            Event Date<span className="required">*</span>
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            className={`form-input ${errors.eventDate ? 'form-input--error' : ''}`}
            value={values.eventDate}
            onChange={handleChange}
          />
          {errors.eventDate && <span className="form-error-text">{errors.eventDate}</span>}
        </div>

        {showStatusField && (
          <div className="form-field">
            <label className="form-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={values.status}
              onChange={handleChange}
            >
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        )}

        <div className="form-field">
          <label className="form-label" htmlFor="startTime">
            Start Time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            className="form-input"
            value={values.startTime}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="endTime">
            End Time
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            className={`form-input ${errors.endTime ? 'form-input--error' : ''}`}
            value={values.endTime}
            onChange={handleChange}
          />
          {errors.endTime && <span className="form-error-text">{errors.endTime}</span>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="maxParticipants">
            Maximum Participants
          </label>
          <input
            id="maxParticipants"
            name="maxParticipants"
            type="number"
            min="1"
            className={`form-input ${errors.maxParticipants ? 'form-input--error' : ''}`}
            value={values.maxParticipants}
            onChange={handleChange}
            placeholder="e.g. 100"
          />
          {errors.maxParticipants && (
            <span className="form-error-text">{errors.maxParticipants}</span>
          )}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="registrationFee">
            Registration Fee (₹)
          </label>
          <input
            id="registrationFee"
            name="registrationFee"
            type="number"
            min="0"
            step="0.01"
            className={`form-input ${errors.registrationFee ? 'form-input--error' : ''}`}
            value={values.registrationFee}
            onChange={handleChange}
            placeholder="e.g. 500.00"
          />
          {errors.registrationFee && (
            <span className="form-error-text">{errors.registrationFee}</span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default EventForm
