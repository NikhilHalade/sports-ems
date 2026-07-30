import { clearAuth, getUserName } from "../utils/auth";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import eventService from "../services/eventService";

function formatDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function formatTime(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":");
  const d = new Date(); d.setHours(+h, +m);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_STYLES = {
  OPEN:      { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500",  label: "Open"      },
  CLOSED:    { bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400",   label: "Closed"    },
  CANCELLED: { bg: "bg-red-100",    text: "text-red-600",    dot: "bg-red-500",    label: "Cancelled" },
};

function EventCard({ event, myBookings, onBook, onCancel, loading }) {
  const s      = STATUS_STYLES[event.status] || STATUS_STYLES.OPEN;
  const start  = formatTime(event.startTime);
  const end    = formatTime(event.endTime);
  const booked = myBookings.some(b => b.eventId === event.eventId && b.status === "CONFIRMED");
  const isFull = event.availableSeats != null && event.availableSeats <= 0;
  const gradients = { OPEN: "from-green-600 to-green-800", CLOSED: "from-gray-500 to-gray-700", CANCELLED: "from-red-500 to-red-700" };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      <div className={`bg-gradient-to-br ${gradients[event.status] || gradients.OPEN} p-5 text-white`}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight">{event.eventName}</h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>{s.label}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-white/80 text-sm">
          <span>📍</span><span className="truncate">{event.venue}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        {event.description && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{event.description}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Date</p>
            <p className="text-gray-800 font-bold text-sm">{formatDate(event.eventDate)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Time</p>
            <p className="text-gray-800 font-bold text-sm">{start ? `${start}${end ? ` – ${end}` : ""}` : "TBA"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Fee</p>
            <p className="text-gray-800 font-bold text-sm">
              {event.registrationFee > 0 ? `₹${Number(event.registrationFee).toFixed(2)}` : "Free"}
            </p>
          </div>
          {/* FR-3.1 — live seat count */}
          <div className={`rounded-xl p-3 ${isFull ? "bg-red-50" : "bg-green-50"}`}>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Seats</p>
            {event.availableSeats != null ? (
              <p className={`font-bold text-sm ${isFull ? "text-red-600" : "text-green-700"}`}>
                {isFull ? "Full" : `${event.availableSeats} left`}
                {event.maxParticipants && <span className="text-gray-400 font-normal"> / {event.maxParticipants}</span>}
              </p>
            ) : (
              <p className="text-gray-800 font-bold text-sm">Unlimited</p>
            )}
          </div>
        </div>

        {/* Seat bar */}
        {event.maxParticipants && event.availableSeats != null && (
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${isFull ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${Math.max(0, Math.min(100, ((event.maxParticipants - event.availableSeats) / event.maxParticipants) * 100))}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {event.maxParticipants - event.availableSeats} / {event.maxParticipants} booked
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {event.status === "OPEN" && (
        <div className="px-5 pb-5 flex gap-2">
          {booked ? (
            <>
              <div className="flex-1 py-2.5 bg-green-100 text-green-700 font-semibold rounded-xl text-center text-sm">
                ✓ Registered
              </div>
              <button
                disabled={loading === event.eventId}
                onClick={() => onCancel(event.eventId)}
                className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-xl hover:bg-red-100 transition text-sm"
              >
                {loading === event.eventId ? "..." : "Cancel"}
              </button>
            </>
          ) : (
            <button
              disabled={isFull || loading === event.eventId}
              onClick={() => onBook(event.eventId)}
              className={`w-full py-2.5 font-semibold rounded-xl transition text-sm ${
                isFull
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loading === event.eventId ? "Processing..." : isFull ? "No Seats Available" : "Register Now"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function UserEventList() {
  const navigate = useNavigate();
  const [events, setEvents]         = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError]           = useState("");
  const [toast, setToast]           = useState(null);
  const [filter, setFilter]         = useState("ALL");

  const userName = getUserName() || "there";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const [evts, bookings] = await Promise.all([
        eventService.getAllEvents(),
        eventService.getMyBookings(),
      ]);
      setEvents(evts);
      setMyBookings(bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleBook(eventId) {
    setActionLoading(eventId);
    try {
      await eventService.bookSeat(eventId);
      showToast("Successfully registered for event! 🎉");
      await loadData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(eventId) {
    setActionLoading(eventId);
    try {
      await eventService.cancelBooking(eventId);
      showToast("Booking cancelled.");
      await loadData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  const filtered = filter === "ALL" ? events : events.filter(e => e.status === filter);
  const counts = {
    ALL: events.length,
    OPEN: events.filter(e => e.status === "OPEN").length,
    CLOSED: events.filter(e => e.status === "CLOSED").length,
    CANCELLED: events.filter(e => e.status === "CANCELLED").length,
  };
  const myConfirmed = myBookings.filter(b => b.status === "CONFIRMED").length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-semibold text-sm transition-all ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🏆 Sports Events</h1>
          <p className="text-green-200 text-sm mt-0.5">
            Welcome, {userName} · {myConfirmed} active registration{myConfirmed !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={handleLogout}
          className="bg-white text-green-700 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition text-sm">
          Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Events",    value: counts.ALL,       color: "text-gray-800"  },
              { label: "Open",            value: counts.OPEN,      color: "text-green-600" },
              { label: "My Registrations",value: myConfirmed,      color: "text-blue-600"  },
              { label: "Closed/Cancelled",value: counts.CLOSED + counts.CANCELLED, color: "text-gray-500" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl shadow p-4 text-center">
                <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wide mt-1 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        {!loading && events.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {["ALL", "OPEN", "CLOSED", "CANCELLED"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === f ? "bg-green-600 text-white shadow" : "bg-white text-gray-600 hover:bg-green-50 border border-gray-200"
                }`}>
                {f === "ALL" ? "All Events" : f.charAt(0) + f.slice(1).toLowerCase()}
                <span className="ml-2 text-xs opacity-70">({counts[f]})</span>
              </button>
            ))}
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-4" />
            <p>Loading events…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🏟️</p>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No events found</h3>
            <p className="text-sm">{filter === "ALL" ? "No events yet. Check back soon!" : `No ${filter.toLowerCase()} events.`}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard key={event.eventId} event={event} myBookings={myBookings}
                onBook={handleBook} onCancel={handleCancel} loading={actionLoading} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserEventList;
