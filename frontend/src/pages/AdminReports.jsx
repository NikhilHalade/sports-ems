import { clearAuth } from "../utils/auth";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import eventService from "../services/eventService";

function StatCard({ label, value, color = "text-gray-800", bg = "bg-white" }) {
  return (
    <div className={`${bg} rounded-2xl shadow p-5 text-center`}>
      <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
      <p className="text-gray-400 text-xs uppercase tracking-wide mt-1 font-semibold">{label}</p>
    </div>
  );
}

function MiniBar({ label, value, max, color = "bg-green-500" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-32 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div className={`${color} h-4 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}

function AdminReports() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]    = useState("");

  useEffect(() => {
    async function load() {
      try { setReport(await eventService.getAdminReport()); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  function exportCSV() {
    if (!report?.eventDetails) return;
    const headers = ["Event ID","Event Name","Venue","Date","Status","Max Participants","Available Seats","Booked Seats","Registration Fee"];
    const rows = report.eventDetails.map(e => [
      e.eventId, `"${e.eventName}"`, `"${e.venue}"`, e.eventDate, e.status,
      e.maxParticipants ?? "Unlimited", e.availableSeats ?? "N/A",
      e.bookedSeats, e.registrationFee ?? 0,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = `sports-ems-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  const byStatus  = report?.eventsByStatus  || {};
  const byRole    = report?.usersByRole     || {};
  const byUStatus = report?.usersByStatus   || {};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-purple-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold">📊 System Reports</h1>
          <p className="text-purple-200 text-sm mt-0.5">Generated {new Date().toLocaleString("en-IN")}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV}
            className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 text-sm">
            ⬇ Export CSV
          </button>
          <Link to="/admin/users"
            className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-800 text-sm">
            👤 Users
          </Link>
          <button onClick={() => { clearAuth(); navigate("/login"); }}
            className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 text-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">{error}</div>}

        {/* Overview stats */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-4">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Events"    value={report?.totalEvents    ?? 0} color="text-gray-800"   />
            <StatCard label="Total Users"     value={report?.totalUsers     ?? 0} color="text-purple-700" />
            <StatCard label="Total Bookings"  value={report?.totalBookings  ?? 0} color="text-blue-600"   />
            <StatCard label="Confirmed Bookings" value={report?.confirmedBookings ?? 0} color="text-green-600" />
          </div>
        </section>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Events by status */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Events by Status</h3>
            <div className="space-y-3">
              {[["OPEN","bg-green-500"],["CLOSED","bg-gray-400"],["CANCELLED","bg-red-500"]].map(([k,c]) => (
                <MiniBar key={k} label={k} value={byStatus[k] || 0} max={report?.totalEvents || 1} color={c} />
              ))}
            </div>
          </div>

          {/* Users by role */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Users by Role</h3>
            <div className="space-y-3">
              {[["ADMIN","bg-purple-500"],["ORGANIZER","bg-blue-500"],["USER","bg-gray-400"]].map(([k,c]) => (
                <MiniBar key={k} label={k} value={byRole[k] || 0} max={report?.totalUsers || 1} color={c} />
              ))}
            </div>
          </div>

          {/* Bookings split */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Booking Status</h3>
            <div className="space-y-3">
              <MiniBar label="Confirmed"  value={report?.confirmedBookings || 0} max={report?.totalBookings || 1} color="bg-green-500" />
              <MiniBar label="Cancelled"  value={report?.cancelledBookings || 0} max={report?.totalBookings || 1} color="bg-red-400" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{report?.cancelledBookings || 0}</p>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Cancelled</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{report?.confirmedBookings || 0}</p>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Confirmed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seat utilization table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">Seat Utilization per Event</h2>
            <button onClick={exportCSV}
              className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold">
              ⬇ Export CSV
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Event","Venue","Date","Status","Capacity","Booked","Available","Fee","Fill %"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(report?.eventDetails || []).length === 0 ? (
                    <tr><td colSpan="9" className="text-center py-10 text-gray-400">No events yet</td></tr>
                  ) : (report?.eventDetails || []).map(e => {
                    const pct = e.maxParticipants > 0 ? Math.round((e.bookedSeats / e.maxParticipants) * 100) : 0;
                    const statusColors = { OPEN: "text-green-600 bg-green-50", CLOSED: "text-gray-500 bg-gray-50", CANCELLED: "text-red-600 bg-red-50" };
                    return (
                      <tr key={e.eventId} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-semibold text-gray-800 max-w-[160px] truncate">{e.eventName}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{e.venue}</td>
                        <td className="px-4 py-3 text-gray-500">{e.eventDate}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[e.status]}`}>{e.status}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">{e.maxParticipants ?? "∞"}</td>
                        <td className="px-4 py-3 text-center font-semibold text-blue-600">{e.bookedSeats}</td>
                        <td className="px-4 py-3 text-center font-semibold text-green-600">{e.availableSeats ?? "∞"}</td>
                        <td className="px-4 py-3 text-gray-600">{e.registrationFee > 0 ? `₹${e.registrationFee}` : "Free"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2 w-16">
                              <div className={`h-2 rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-yellow-400" : "bg-green-500"}`}
                                style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-600">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminReports;
