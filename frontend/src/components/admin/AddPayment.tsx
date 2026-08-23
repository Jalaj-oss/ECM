import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import API_URL from "../../config/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface Bill {
  id: number;
  user_id: number;
  amount: number;
  billing_month: string;
  status: string;
}

const AddPayment = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [userId, setUserId] = useState("");
  const [billId, setBillId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [status, setStatus] = useState<"pending" | "completed" | "failed">("completed");
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
        const [usersResponse, billsResponse] = await Promise.all([
          fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/bills`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const usersData = await usersResponse.json();
        const billsData = await billsResponse.json();

        if (!usersResponse.ok) {
          setError(usersData.message || "Failed to load users");
          return;
        }
        if (!billsResponse.ok) {
          setError(billsData.message || "Failed to load bills");
          return;
        }

        setUsers(usersData.users);
        setBills(billsData.bills);
      } catch (error) {
        console.error("Load payment data error:", error);
        setError("Unable to connect to server");
      }
    };

    load();
  }, [navigate]);

  const userBills = bills.filter(
    (bill) => Number(bill.user_id) === Number(userId)
  );

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!userId || !billId || !amount || Number(amount) <= 0) {
      setError("User, bill and a valid amount are required");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: Number(userId),
          bill_id: Number(billId),
          amount: Number(amount),
          payment_date: paymentDate || null,
          payment_method: paymentMethod,
          transaction_id: transactionId || null,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create payment");
        return;
      }

      alert("Payment recorded successfully");
      navigate("/admin/payments");
    } catch (error) {
      console.error("Create payment error:", error);
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
            <h1 className="text-3xl font-bold">Add Payment</h1>
            <p className="mt-2 text-gray-600">Record a bill payment</p>
          </div>
          <button type="button" onClick={() => navigate("/admin/payments")} className="rounded-lg border px-4 py-2 hover:bg-gray-100">
            Back to Payments
          </button>
        </div>

        <div className="mt-8 max-w-xl rounded-xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium">User</label>
              <select
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setBillId("");
                }}
                className="mt-2 w-full rounded-lg border p-2"
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
              <label className="block text-sm font-medium">Bill</label>
              <select value={billId} onChange={(e) => setBillId(e.target.value)} className="mt-2 w-full rounded-lg border p-2" disabled={!userId}>
                <option value="">Select bill</option>
                {userBills.map((bill) => (
                  <option key={bill.id} value={bill.id}>
                    Bill #{bill.id} - ₹{Number(bill.amount).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Amount</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2 w-full rounded-lg border p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium">Payment Date</label>
              <input type="datetime-local" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="mt-2 w-full rounded-lg border p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-2 w-full rounded-lg border p-2">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Transaction ID</label>
              <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="mt-2 w-full rounded-lg border p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as "pending" | "completed" | "failed")} className="mt-2 w-full rounded-lg border p-2">
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={saving} className="w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50">
              {saving ? "Saving..." : "Record Payment"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddPayment;
