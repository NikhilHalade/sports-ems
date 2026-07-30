/**
 * Full-area loading indicator.
 * @param {{label?: string}} props
 */
function Loader({ label = 'Loading events…' }) {
  return (
    <div className="loader-wrapper">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  )
}

export default Loader
