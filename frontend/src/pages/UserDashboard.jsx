import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getUserName, getEmail } from "../utils/auth";
import eventService from "../services/eventService";

function formatDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const STATUS_STYLES = {
  CONFIRMED: { bg: "bg-green-100", text: "text-green-700", label: "Confirmed" },
  CANCELLED: { bg: "bg-red-100",   text: "text-red-600",   label: "Cancelled" },
};

function UserDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const userName = getUserName() || "there";
  const email    = getEmail() || "—";

  const loadData = useCallback(async () => {
    try {
      const data = await eventService.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  // Clicking a registered event should take the user to their events page.
  function handleEventClick() {
    navigate("/user/events");
  }

  const confirmed = bookings.filter(b => b.status === "CONFIRMED");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">👤 My Dashboard</h1>
          <p className="text-green-200 text-sm mt-0.5">Welcome back, {userName}</p>
        </div>
        <button onClick={handleLogout}
          className="bg-white text-green-700 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition text-sm">
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Name</p>
            <p className="text-lg font-bold text-gray-800 mb-2">{userName}</p>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Email</p>
            <p className="text-lg font-bold text-gray-800">{email}</p>
          </div>
        </div>

        {/* Registered events */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">My Registered Events</h2>
          <button
            onClick={() => navigate("/user/events")}
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            Browse all events →
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-4" />
            <p>Loading your events…</p>
          </div>
        ) : confirmed.length === 0 ? (
          <div className="bg-white text-center py-16 rounded-2xl shadow text-gray-400">
            <p className="text-5xl mb-4">🏟️</p>
            <h3 className="text-lg font-bold text-gray-600 mb-2">No events registered yet</h3>
            <p className="text-sm mb-4">Browse events and register to see them here.</p>
            <button
              onClick={() => navigate("/user/events")}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {confirmed.map(b => {
              const s = STATUS_STYLES[b.status] || STATUS_STYLES.CONFIRMED;
              return (
                <button
                  key={b.bookingId}
                  onClick={handleEventClick}
                  className="text-left bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-5 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{b.eventName}</h3>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm flex items-center gap-1.5">
                    <span>📍</span><span className="truncate">{b.venue}</span>
                  </p>
                  <p className="text-gray-500 text-sm">📅 {formatDate(b.eventDate)}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
