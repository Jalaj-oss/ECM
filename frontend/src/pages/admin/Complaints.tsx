import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import API_URL from "../../config/api";

interface AdminComplaint {
  id: number;
  user_id: number;
  meter_id?: number | null;
  meter_number?: string | null;
  category: string;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  admin_remarks?: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string | null;
  user_email?: string | null;
  user_phone?: string | null;
}

const Complaints = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal / Update Status State
  const [activeComplaint, setActiveComplaint] = useState<AdminComplaint | null>(null);
  const [newStatus, setNewStatus] = useState<AdminComplaint["status"]>("resolved");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load complaints");
        return;
      }

      setComplaints(data.complaints || []);
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [navigate]);

  const openUpdateModal = (complaint: AdminComplaint, defaultStatus?: AdminComplaint["status"]) => {
    setActiveComplaint(complaint);
    setNewStatus(defaultStatus || complaint.status);
    setAdminRemarks(complaint.admin_remarks || "");
    setUpdateError("");
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;

    try {
      setUpdating(true);
      setUpdateError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/complaints/${activeComplaint.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          admin_remarks: adminRemarks.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUpdateError(data.message || "Failed to update complaint");
        return;
      }

      // Update in local state
      setComplaints((prev) =>
        prev.map((item) =>
          item.id === activeComplaint.id
            ? { ...item, status: newStatus, admin_remarks: adminRemarks.trim() }
            : item
        )
      );

      setActiveComplaint(null);
    } catch {
      setUpdateError("Unable to update complaint. Server connection error.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete Complaint #CMP-${id}?`)) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/complaints/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete complaint");
        return;
      }

      setComplaints((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("Unable to delete complaint. Server connection error.");
    }
  };

  const getStatusBadge = (status: AdminComplaint["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
            Pending
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
            Resolved / Closed
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            Rejected / Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
            {status}
          </span>
        );
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      c.subject.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term) ||
      (c.user_name && c.user_name.toLowerCase().includes(term)) ||
      (c.user_email && c.user_email.toLowerCase().includes(term)) ||
      String(c.id).includes(term);

    return matchesStatus && matchesSearch;
  });

  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "in_progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complaints Management</h1>
            <p className="mt-1 text-gray-600">
              Review consumer complaints, take action, resolve issues, and provide remarks
            </p>
          </div>

          <button
            onClick={fetchComplaints}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {/* Quick stat chips */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total Grievances</p>
            <p className="mt-1 text-2xl font-bold">{complaints.length}</p>
          </div>
          <div className="rounded-xl border bg-amber-50/60 p-4 shadow-sm">
            <p className="text-xs font-medium text-amber-700">Pending Review</p>
            <p className="mt-1 text-2xl font-bold text-amber-900">{pendingCount}</p>
          </div>
          <div className="rounded-xl border bg-blue-50/60 p-4 shadow-sm">
            <p className="text-xs font-medium text-blue-700">In Progress</p>
            <p className="mt-1 text-2xl font-bold text-blue-900">{inProgressCount}</p>
          </div>
          <div className="rounded-xl border bg-emerald-50/60 p-4 shadow-sm">
            <p className="text-xs font-medium text-emerald-700">Resolved</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900">{resolvedCount}</p>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: `All (${complaints.length})` },
              { id: "pending", label: `Pending (${pendingCount})` },
              { id: "in_progress", label: `In Progress (${inProgressCount})` },
              { id: "resolved", label: `Resolved (${resolvedCount})` },
              { id: "rejected", label: `Rejected` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user, email, subject..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div className="mt-8 text-gray-500">Loading complaints...</div>
        ) : error ? (
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            No complaints found matching current criteria.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Category & Subject</th>
                    <th className="px-5 py-3.5">Meter</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Filed On</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-5 py-4 font-mono font-bold text-gray-700">
                        #CMP-{c.id}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{c.user_name || "Unknown User"}</p>
                        <p className="text-xs text-gray-500">{c.user_email || "—"}</p>
                        {c.user_phone && <p className="text-xs text-gray-400">{c.user_phone}</p>}
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <span className="inline-block text-xs font-semibold text-blue-600">
                          {c.category}
                        </span>
                        <p className="font-medium text-gray-800 truncate">{c.subject}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{c.description}</p>
                        {c.admin_remarks && (
                          <div className="mt-1.5 rounded bg-blue-50/80 p-1.5 text-xs text-blue-900 border border-blue-100">
                            <span className="font-semibold">Remarks:</span> {c.admin_remarks}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {c.meter_number ? (
                          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-700">
                            #{c.meter_number}
                          </span>
                        ) : (
                          <span className="text-gray-400">General</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(c.status)}
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {c.status !== "resolved" && (
                            <button
                              type="button"
                              onClick={() => openUpdateModal(c, "resolved")}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                            >
                              Resolve
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openUpdateModal(c)}
                            className="rounded-lg border px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                          >
                            Update Status
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                            title="Delete Complaint"
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
          </div>
        )}

        {/* Modal: Resolve / Update Status */}
        {activeComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Resolve / Update Complaint #CMP-{activeComplaint.id}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Customer: {activeComplaint.user_name} ({activeComplaint.user_email})
                  </p>
                </div>
                <button
                  onClick={() => setActiveComplaint(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-3.5 text-xs text-gray-600 border">
                <p className="font-semibold text-gray-800">{activeComplaint.subject}</p>
                <p className="mt-1 text-gray-600">{activeComplaint.description}</p>
              </div>

              <form onSubmit={handleUpdateStatus} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Change Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as AdminComplaint["status"])}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="in_progress">In Progress (Under Investigation)</option>
                    <option value="resolved">Resolved (Close Complaint)</option>
                    <option value="rejected">Rejected (Close Complaint)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resolution Remarks / Notes for Customer
                  </label>
                  <textarea
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    rows={4}
                    placeholder="e.g. Technician dispatched and reading reconciled. Issue has been resolved."
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    This note will be visible to the customer on their dashboard and complaints page.
                  </p>
                </div>

                {updateError && (
                  <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
                    {updateError}
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveComplaint(null)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save & Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Complaints;
