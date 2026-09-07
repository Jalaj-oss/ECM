import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";
import API_URL from "../../config/api";

interface Complaint {
  id: number;
  meter_id?: number | null;
  meter_number?: string | null;
  category: string;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  admin_remarks?: string | null;
  created_at: string;
}

interface Meter {
  id: number;
  meter_number: string;
  meter_type: string;
}

const CATEGORIES = [
  "Billing Dispute",
  "Meter Reading / Faulty Meter",
  "Power Outage / Line Fault",
  "Voltage Fluctuation",
  "Payment Not Reflected",
  "New Connection Request",
  "Other Service Issue",
];

const UserComplaints = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [meterId, setMeterId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/user/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [compRes, meterRes] = await Promise.all([
        fetch(`${API_URL}/api/user/complaints`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/user/meters`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const compData = await compRes.json();
      const meterData = await meterRes.json();

      if (!compRes.ok) {
        setError(compData.message || "Failed to load complaints");
      } else {
        setComplaints(compData.complaints || []);
      }

      if (meterRes.ok && meterData.meters) {
        setMeters(meterData.meters);
        if (meterData.meters.length > 0) {
          setMeterId(String(meterData.meters[0].id));
        }
      }
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!subject.trim() || !description.trim()) {
      setFormError("Subject and description are required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/user/login");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_URL}/api/user/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          meter_id: meterId ? Number(meterId) : null,
          subject: subject.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "Failed to submit complaint.");
        return;
      }

      setFormSuccess("Your complaint has been registered successfully!");
      setSubject("");
      setDescription("");

      // Refresh complaints list
      await fetchData();

      setTimeout(() => {
        setShowForm(false);
        setFormSuccess("");
      }, 1500);
    } catch {
      setFormError("Unable to submit complaint. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-xs font-semibold text-yellow-800">
            Pending Review
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-800">
            In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-800">
            Resolved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-xs font-semibold text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complaints & Grievances</h1>
            <p className="mt-1 text-gray-600">Raise issues and track their resolution status</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setFormError("");
              setFormSuccess("");
            }}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Raise a Complaint"}
          </button>
        </div>

        {/* Raise Complaint Form Section */}
        {showForm && (
          <div className="mt-8 rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">File a New Complaint</h2>
            <p className="mt-1 text-sm text-gray-500">
              Provide the details below. Our support and technical team will address your issue promptly.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Associated Meter (Optional)
                  </label>
                  <select
                    value={meterId}
                    onChange={(e) => setMeterId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">-- None / General Complaint --</option>
                    {meters.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        Meter #{m.meter_number} ({m.meter_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Incorrect meter reading on latest bill"
                  required
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Detailed Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Explain the problem in detail (dates, meter readings, observations)..."
                  required
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 font-medium">
                  {formSuccess}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints History Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">Your Filed Complaints</h2>

          {loading ? (
            <p className="mt-4 text-gray-500">Loading complaints...</p>
          ) : error ? (
            <p className="mt-4 text-red-500">{error}</p>
          ) : complaints.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
              <p className="text-base font-medium text-gray-700">No complaints registered yet.</p>
              <p className="mt-1 text-sm text-gray-500">
                If you are experiencing any issues with billing, meters, or power supply, click below to file a complaint.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + Raise a Complaint
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                        #CMP-{c.id}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        {c.category}
                      </span>
                      {c.meter_number && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          Meter #{c.meter_number}
                        </span>
                      )}
                    </div>
                    <div>{getStatusBadge(c.status)}</div>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-gray-900">{c.subject}</h3>
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{c.description}</p>

                  {c.admin_remarks && (
                    <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/70 p-3.5 text-sm text-blue-900">
                      <p className="font-semibold text-blue-800">Department Remarks / Resolution:</p>
                      <p className="mt-1 text-blue-950">{c.admin_remarks}</p>
                    </div>
                  )}

                  <div className="mt-4 border-t pt-3 text-xs text-gray-400">
                    Submitted on: {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserComplaints;
