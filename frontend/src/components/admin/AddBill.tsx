import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import API_URL from "../../config/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface Meter {
  id: number;
  meter_number: string;
  user_id: number;
  meter_type: string;
  status: "active" | "inactive";
}

const AddBill = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [userId, setUserId] = useState("");
  const [meterId, setMeterId] = useState("");
  const [billingMonth, setBillingMonth] = useState("");
  const [previousReading, setPreviousReading] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [unitsConsumed, setUnitsConsumed] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"pending" | "paid" | "overdue">("pending");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      try {
        const [usersResponse, metersResponse] = await Promise.all([
          fetch(`${API_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/meters`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const usersData = await usersResponse.json();
        const metersData = await metersResponse.json();

        if (!usersResponse.ok) {
          setError(usersData.message || "Failed to load users");
          return;
        }

        if (!metersResponse.ok) {
          setError(metersData.message || "Failed to load meters");
          return;
        }

        setUsers(usersData.users);
        setMeters(metersData.meters);
      } catch (error) {
        console.error("Load add bill data error:", error);
        setError("Unable to connect to server");
      }
    };

    load();
  }, [navigate]);

  // Auto-calculate Units Consumed whenever Previous Reading or Current Reading changes
  useEffect(() => {
    if (previousReading !== "" && currentReading !== "") {
      const prev = Number(previousReading);
      const curr = Number(currentReading);
      if (!Number.isNaN(prev) && !Number.isNaN(curr)) {
        const units = Math.max(0, curr - prev);
        setUnitsConsumed(String(units));
      }
    }
  }, [previousReading, currentReading]);

  const userMeters = meters.filter(
    (meter) => Number(meter.user_id) === Number(userId)
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (
      !userId ||
      !meterId ||
      !billingMonth ||
      previousReading === "" ||
      currentReading === "" ||
      unitsConsumed === "" ||
      amount === "" ||
      !dueDate
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (Number(currentReading) < Number(previousReading)) {
      setError("Current reading cannot be less than previous reading");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/bills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: Number(userId),
          meter_id: Number(meterId),
          billing_month: billingMonth,
          previous_reading: Number(previousReading),
          current_reading: Number(currentReading),
          units_consumed: Number(unitsConsumed),
          amount: Number(amount),
          due_date: dueDate,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create bill");
        return;
      }

      alert("Bill created successfully");
      navigate("/admin/bills");
    } catch (error) {
      console.error("Create bill error:", error);
      setError("Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Add Bill</h1>
            <p className="mt-2 text-gray-600">Create a new electricity bill</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/bills")}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            Back to Bills
          </button>
        </div>

        <div className="mt-8 max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium">User</label>
              <select
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setMeterId("");
                }}
                className="mt-2 w-full rounded-lg border p-2"
                required
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Meter</label>
              <select
                value={meterId}
                onChange={(e) => setMeterId(e.target.value)}
                className="mt-2 w-full rounded-lg border p-2"
                disabled={!userId}
                required
              >
                <option value="">Select meter</option>
                {userMeters.map((meter) => (
                  <option key={meter.id} value={meter.id}>
                    {meter.meter_number} ({meter.meter_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Billing Month</label>
                <input
                  type="date"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  className="mt-2 w-full rounded-lg border p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border p-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Previous Reading</label>
                <input
                  type="number"
                  step="0.01"
                  value={previousReading}
                  onChange={(e) => setPreviousReading(e.target.value)}
                  placeholder="e.g. 500"
                  className="mt-2 w-full rounded-lg border p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Current Reading</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentReading}
                  onChange={(e) => setCurrentReading(e.target.value)}
                  placeholder="e.g. 800"
                  className="mt-2 w-full rounded-lg border p-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Units Consumed</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitsConsumed}
                  onChange={(e) => setUnitsConsumed(e.target.value)}
                  placeholder="Auto-calculated (Current - Previous)"
                  className="mt-2 w-full rounded-lg border p-2 bg-blue-50/50"
                  required
                />
                <p className="mt-1 text-xs text-blue-600 font-medium">
                  Auto-calculated: Current Reading − Previous Reading
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter total bill amount"
                  className="mt-2 w-full rounded-lg border p-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "pending" | "paid" | "overdue")
                }
                className="mt-2 w-full rounded-lg border p-2 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {saving ? "Creating Bill..." : "Create Bill"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddBill;
