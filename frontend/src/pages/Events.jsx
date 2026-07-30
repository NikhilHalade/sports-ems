import { getToken } from "../utils/auth";
import { useEffect, useState } from "react";
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

const gradients = {
  OPEN:      "from-green-600 to-green-800",
  CLOSED:    "from-gray-500 to-gray-700",
  CANCELLED: "from-red-500 to-red-700",
};

function EventCard({ event, isLoggedIn, onRegisterClick }) {
  const s     = STATUS_STYLES[event.status] || STATUS_STYLES.OPEN;
  const start = formatTime(event.startTime);
  const end   = formatTime(event.endTime);
  const isFull = event.availableSeats != null && event.availableSeats <= 0;

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
            <p className="text-gray-800 font-bold text-sm">
              {start ? `${start}${end ? ` – ${end}` : ""}` : "TBA"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Fee</p>
            <p className="text-gray-800 font-bold text-sm">
              {event.registrationFee > 0 ? `₹${Number(event.registrationFee).toFixed(2)}` : "Free"}
            </p>
          </div>
          <div className={`rounded-xl p-3 ${isFull ? "bg-red-50" : "bg-green-50"}`}>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Seats</p>
            {event.availableSeats != null ? (
              <p className={`font-bold text-sm ${isFull ? "text-red-600" : "text-green-700"}`}>
                {isFull ? "Full" : `${event.availableSeats} left`}
                {event.maxParticipants &&
                  <span className="text-gray-400 font-normal"> / {event.maxParticipants}</span>}
              </p>
            ) : (
              <p className="text-gray-800 font-bold text-sm">Unlimited</p>
            )}
          </div>
        </div>

        {/* Seat fill bar */}
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

      {/* CTA */}
      {event.status === "OPEN" && (
        <div className="px-5 pb-5">
          {isLoggedIn ? (
            <button
              disabled={isFull}
              onClick={() => onRegisterClick(event.eventId)}
              className={`w-full py-2.5 font-semibold rounded-xl transition text-sm ${
                isFull
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isFull ? "No Seats Available" : "Register Now"}
            </button>
          ) : (
            <button
              onClick={() => onRegisterClick(null)}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition text-sm"
            >
              Login to Register
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Events() {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("ALL");
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function load() {
      try {
        // Public fetch — no auth header needed for viewing
        const res = await fetch("http://localhost:8080/api/events", {
          headers: isLoggedIn
            ? { Authorization: `Bearer ${getToken()}` }
            : {},
        });
        if (!res.ok) throw new Error("Failed to load events");
        setEvents(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRegisterClick(eventId) {
    if (!eventId) {
      // Not logged in — redirect to login
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8080/api/bookings/events/${eventId}/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      showToast("Successfully registered! 🎉");
      // Refresh events to update seat count
      const updated = await fetch("http://localhost:8080/api/events", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setEvents(await updated.json());
    } catch (e) {
      showToast(e.message, "error");
    }
  }

  const counts = {
    ALL:       events.length,
    OPEN:      events.filter(e => e.status === "OPEN").length,
    CLOSED:    events.filter(e => e.status === "CLOSED").length,
    CANCELLED: events.filter(e => e.status === "CANCELLED").length,
  };
  const filtered = filter === "ALL" ? events : events.filter(e => e.status === filter);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-semibold text-sm ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="bg-green-700 text-white px-6 py-8 text-center">
        <h1 className="text-3xl font-bold mb-2">🏆 Upcoming Sports Events</h1>
        <p className="text-green-200 text-sm">
          Browse all events below.{" "}
          {isLoggedIn
            ? "Click Register Now to book your seat."
            : <span>
                <button onClick={() => navigate("/login")}
                  className="underline font-semibold hover:text-white">Login</button>
                {" "}or{" "}
                <button onClick={() => navigate("/register")}
                  className="underline font-semibold hover:text-white">Register</button>
                {" "}to book a seat.
              </span>
          }
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        {!loading && events.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Events", value: counts.ALL,       color: "text-gray-800"  },
              { label: "Open",         value: counts.OPEN,      color: "text-green-600" },
              { label: "Closed",       value: counts.CLOSED,    color: "text-gray-500"  },
              { label: "Cancelled",    value: counts.CANCELLED, color: "text-red-500"   },
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
            {["ALL","OPEN","CLOSED","CANCELLED"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === f
                    ? "bg-green-600 text-white shadow"
                    : "bg-white text-gray-600 hover:bg-green-50 border border-gray-200"
                }`}>
                {f === "ALL" ? "All Events" : f.charAt(0) + f.slice(1).toLowerCase()}
                <span className="ml-2 text-xs opacity-70">({counts[f]})</span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-4" />
            <p>Loading events…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🏟️</p>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No events found</h3>
            <p className="text-sm">
              {filter === "ALL" ? "No events yet. Check back soon!" : `No ${filter.toLowerCase()} events.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard
                key={event.eventId}
                event={event}
                isLoggedIn={isLoggedIn}
                onRegisterClick={handleRegisterClick}
              />
            ))}
          </div>
        )}

        {/* Login prompt banner for guests */}
        {!isLoggedIn && events.some(e => e.status === "OPEN") && (
          <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-green-800 font-semibold text-lg mb-2">Want to register for an event?</p>
            <p className="text-green-600 text-sm mb-4">Create a free account or login to book your seat instantly.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/register")}
                className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition">
                Create Account
              </button>
              <button onClick={() => navigate("/login")}
                className="bg-white text-green-700 border border-green-300 px-6 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition">
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
