import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import API_URL from "../../config/api";

interface Bill {
  id: number;
  user_id: number;
  meter_id: number;
  billing_month: string;
  previous_reading: number;
  current_reading: number;
  units_consumed: number;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  user_name: string;
  user_email: string;
  meter_number: string;
}

const dateOnly = (value: string) => value?.split("T")[0] || "—";

const Bills = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load bills");
        return;
      }

      setBills(data.bills);
    } catch (error) {
      console.error("Fetch bills error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [navigate]);

  const handleDelete = async (bill: Bill) => {
    if (!window.confirm(`Delete bill #${bill.id}?`)) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/bills/${bill.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete bill");
        return;
      }

      setBills((current) => current.filter((item) => item.id !== bill.id));
      alert("Bill deleted successfully");
    } catch (error) {
      console.error("Delete bill error:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bills</h1>
            <p className="mt-2 text-gray-600">Manage EHMS bills</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/bills/add")}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Add Bill
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
            <p className="p-6 text-center text-gray-500">Loading bills...</p>
          ) : error ? (
            <p className="p-6 text-center text-red-500">{error}</p>
          ) : bills.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No bills found</p>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Bill</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Meter</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Month</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Due</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id} className="border-b last:border-b-0">
                    <td className="px-6 py-4">#{bill.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{bill.user_name}</p>
                      <p className="text-sm text-gray-500">{bill.user_email}</p>
                    </td>
                    <td className="px-6 py-4">{bill.meter_number}</td>
                    <td className="px-6 py-4">{dateOnly(bill.billing_month)}</td>
                    <td className="px-6 py-4">₹{Number(bill.amount).toFixed(2)}</td>
                    <td className="px-6 py-4">{dateOnly(bill.due_date)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          bill.status === "paid"
                            ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                            : bill.status === "overdue"
                            ? "rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                            : "rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700"
                        }
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/bills/${bill.id}`)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/bills/${bill.id}/edit`)}
                          className="text-green-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(bill)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
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

export default Bills;
