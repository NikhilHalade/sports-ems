import { clearAuth } from "../utils/auth";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import eventService from "../services/eventService";

const ROLE_COLORS   = { ADMIN: "bg-purple-100 text-purple-700", ORGANIZER: "bg-blue-100 text-blue-700", USER: "bg-gray-100 text-gray-600" };
const STATUS_COLORS = { ACTIVE: "bg-green-100 text-green-700", LOCKED: "bg-red-100 text-red-600", PENDING_APPROVAL: "bg-yellow-100 text-yellow-700" };

function AdminUserManagement() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState("ALL");   // ALL | PENDING
  const [users, setUsers]         = useState([]);
  const [pending, setPending]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState(null);
  const [toast, setToast]         = useState(null);
  const [search, setSearch]       = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [all, pend] = await Promise.all([
        eventService.getAllUsers(),
        eventService.getPendingUsers(),
      ]);
      setUsers(all);
      setPending(pend);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleApprove(id, name) {
    setActionId(id);
    try {
      await eventService.approveUser(id);
      showToast(`✅ ${name} approved! They will receive an email notification.`);
      await loadData();
    } catch (e) { showToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleReject(id, name) {
    setActionId(id);
    try {
      await eventService.rejectUser(id);
      showToast(`${name}'s account rejected and removed.`, "error");
      await loadData();
    } catch (e) { showToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleStatus(id, newStatus) {
    setActionId(id);
    try {
      await eventService.updateUserStatus(id, newStatus);
      showToast(`User ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully`);
      await loadData();
    } catch (e) { showToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleRole(id, newRole) {
    setActionId(id);
    try {
      await eventService.updateUserRole(id, newRole);
      showToast("Role updated. User will receive an email notification.");
      await loadData();
    } catch (e) { showToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  async function handleDelete(id) {
    setActionId(id);
    try {
      await eventService.deleteUser(id);
      showToast("User deleted");
      setConfirmDelete(null);
      await loadData();
    } catch (e) { showToast(e.message, "error"); }
    finally { setActionId(null); }
  }

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-semibold text-sm max-w-sm ${
          toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete User?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Permanently delete <strong>{confirmDelete.fullName}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)} disabled={actionId === confirmDelete.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm disabled:opacity-50">
                {actionId === confirmDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-purple-700 text-white px-6 py-4 flex items-center justify-between shadow-md flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">👤 User Management</h1>
          <p className="text-purple-200 text-sm mt-0.5">
            {users.length} total users
            {pending.length > 0 && (
              <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {pending.length} pending
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/admin/reports" className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 text-sm">
            📊 Reports
          </Link>
          <Link to="/events/manage" className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-800 text-sm">
            Events
          </Link>
          <button onClick={() => { clearAuth(); navigate("/login"); }}
            className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 text-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Users",     value: users.length,                                     color: "text-gray-800"   },
            { label: "Active",          value: users.filter(u => u.status === "ACTIVE").length,  color: "text-green-600"  },
            { label: "Pending Approval",value: pending.length,                                   color: "text-yellow-600" },
            { label: "Locked",          value: users.filter(u => u.status === "LOCKED").length,  color: "text-red-500"    },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow p-4 text-center">
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wide mt-1 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {["ALL", "PENDING"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition ${
                tab === t ? "bg-purple-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-purple-50"
              }`}>
              {t === "PENDING" ? `⏳ Pending Approval (${pending.length})` : "All Users"}
            </button>
          ))}
        </div>

        {/* PENDING APPROVALS TAB */}
        {tab === "PENDING" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {pending.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-semibold">No pending approvals</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pending.map(u => (
                  <div key={u.id} className="p-5 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-bold text-gray-800">{u.fullName}</p>
                      <p className="text-sm text-gray-500">{u.email} · {u.mobileNumber}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Role: <span className={`font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                        &nbsp;· Registered: {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(u.id, u.fullName)}
                        disabled={actionId === u.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-50">
                        {actionId === u.id ? "..." : "✅ Approve"}
                      </button>
                      <button onClick={() => handleReject(u.id, u.fullName)}
                        disabled={actionId === u.id}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold text-sm hover:bg-red-100 disabled:opacity-50">
                        {actionId === u.id ? "..." : "❌ Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL USERS TAB */}
        {tab === "ALL" && (
          <>
            <input type="text" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full mb-4 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-sm text-sm" />
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["#","Name","Email","Mobile","Role","Status","Last Login","Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="8" className="text-center py-12 text-gray-400">Loading…</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan="8" className="text-center py-12 text-gray-400">No users found</td></tr>
                    ) : filtered.map((u, i) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{u.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3 text-gray-500">{u.mobileNumber || "—"}</td>
                        <td className="px-4 py-3">
                          <select value={u.role} disabled={actionId === u.id}
                            onChange={e => handleRole(u.id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${ROLE_COLORS[u.role]}`}>
                            <option value="USER">USER</option>
                            <option value="ORGANIZER">ORGANIZER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[u.status] || "bg-gray-100 text-gray-600"}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("en-IN") : "Never"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {u.status === "PENDING_APPROVAL" ? (
                              <button onClick={() => handleApprove(u.id, u.fullName)}
                                disabled={actionId === u.id}
                                className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                                Approve
                              </button>
                            ) : u.status === "ACTIVE" ? (
                              <button onClick={() => handleStatus(u.id, "LOCKED")}
                                disabled={actionId === u.id}
                                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 disabled:opacity-50">
                                Deactivate
                              </button>
                            ) : (
                              <button onClick={() => handleStatus(u.id, "ACTIVE")}
                                disabled={actionId === u.id}
                                className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg font-semibold hover:bg-green-100 disabled:opacity-50">
                                Activate
                              </button>
                            )}
                            <button onClick={() => setConfirmDelete(u)}
                              className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminUserManagement;
