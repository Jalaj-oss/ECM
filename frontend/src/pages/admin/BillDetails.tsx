import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  meter_type: string;
}

const dateOnly = (value: string) => value?.split("T")[0] || "—";

const BillDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);
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

        const response = await fetch(
          `${API_URL}/api/bills/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load bill");
          return;
        }

        setBill(data.bill);
      } catch (error) {
        console.error("Fetch bill error:", error);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bill Details</h1>
            <p className="mt-2 text-gray-600">View billing information</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/bills")}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            Back to Bills
          </button>
        </div>

        {loading && <p className="mt-8 text-gray-500">Loading bill...</p>}
        {error && <p className="mt-8 text-red-500">{error}</p>}

        {bill && (
          <div className="mt-8 max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div><p className="text-sm text-gray-500">Bill ID</p><p className="font-medium">#{bill.id}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><p className="font-medium">{bill.status}</p></div>
              <div><p className="text-sm text-gray-500">User</p><p className="font-medium">{bill.user_name}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{bill.user_email}</p></div>
              <div><p className="text-sm text-gray-500">Meter</p><p className="font-medium">{bill.meter_number}</p></div>
              <div><p className="text-sm text-gray-500">Meter Type</p><p className="font-medium">{bill.meter_type}</p></div>
              <div><p className="text-sm text-gray-500">Billing Month</p><p className="font-medium">{dateOnly(bill.billing_month)}</p></div>
              <div><p className="text-sm text-gray-500">Due Date</p><p className="font-medium">{dateOnly(bill.due_date)}</p></div>
              <div><p className="text-sm text-gray-500">Previous Reading</p><p className="font-medium">{bill.previous_reading}</p></div>
              <div><p className="text-sm text-gray-500">Current Reading</p><p className="font-medium">{bill.current_reading}</p></div>
              <div><p className="text-sm text-gray-500">Units Consumed</p><p className="font-medium">{bill.units_consumed}</p></div>
              <div><p className="text-sm text-gray-500">Amount</p><p className="font-medium">₹{Number(bill.amount).toFixed(2)}</p></div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/admin/bills/${bill.id}/edit`)}
              className="mt-8 rounded-lg bg-blue-500 px-5 py-2 text-white hover:bg-blue-600"
            >
              Edit Bill
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BillDetails;
