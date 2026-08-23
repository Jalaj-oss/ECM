import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import API_URL from "../../config/api";

interface Payment {
  id: number;
  bill_id: number;
  user_id: number;
  amount: number;
  payment_date: string;
  payment_method: "cash" | "card" | "upi" | "bank_transfer";
  transaction_id: string | null;
  status: "pending" | "completed" | "failed";
  user_name: string;
  user_email: string;
  billing_month: string;
  meter_number: string;
}

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load payments");
          return;
        }

        setPayments(data.payments);
      } catch (error) {
        console.error("Fetch payments error:", error);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const handleDelete = async (payment: Payment) => {
    if (!window.confirm(`Delete payment #${payment.id}?`)) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/payments/${payment.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete payment");
        return;
      }

      setPayments((current) =>
        current.filter((item) => item.id !== payment.id)
      );
      alert("Payment deleted successfully");
    } catch (error) {
      console.error("Delete payment error:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="mt-2 text-gray-600">Manage bill payments</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/payments/add")}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Add Payment
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-lg border px-4 py-2 hover:bg-gray-100"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading payments...</p>
          ) : error ? (
            <p className="p-6 text-center text-red-500">{error}</p>
          ) : payments.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No payments found</p>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Bill</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Method</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-b-0">
                    <td className="px-6 py-4">#{payment.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{payment.user_name}</p>
                      <p className="text-sm text-gray-500">{payment.user_email}</p>
                    </td>
                    <td className="px-6 py-4">#{payment.bill_id}</td>
                    <td className="px-6 py-4">₹{Number(payment.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">{payment.payment_method}</td>
                    <td className="px-6 py-4">
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4">{payment.status}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button type="button" onClick={() => navigate(`/admin/payments/${payment.id}`)} className="text-blue-600 hover:underline">View</button>
                        <button type="button" onClick={() => handleDelete(payment)} className="text-red-600 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Payments;
