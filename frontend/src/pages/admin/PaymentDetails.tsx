import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

interface Payment {
  id: number;
  bill_id: number;
  user_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string | null;
  status: string;
  user_name: string;
  user_email: string;
  billing_month: string;
  due_date: string;
  bill_amount: number;
  meter_number: string;
}

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
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
          `/api/payments/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load payment");
          return;
        }

        setPayment(data.payment);
      } catch (error) {
        console.error("Fetch payment error:", error);
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
            <h1 className="text-3xl font-bold">Payment Details</h1>
            <p className="mt-2 text-gray-600">View payment information</p>
          </div>
          <button type="button" onClick={() => navigate("/admin/payments")} className="rounded-lg border px-4 py-2 hover:bg-gray-100">
            Back to Payments
          </button>
        </div>

        {loading && <p className="mt-8 text-gray-500">Loading payment...</p>}
        {error && <p className="mt-8 text-red-500">{error}</p>}

        {payment && (
          <div className="mt-8 max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div><p className="text-sm text-gray-500">Payment ID</p><p className="font-medium">#{payment.id}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><p className="font-medium">{payment.status}</p></div>
              <div><p className="text-sm text-gray-500">User</p><p className="font-medium">{payment.user_name}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{payment.user_email}</p></div>
              <div><p className="text-sm text-gray-500">Bill</p><p className="font-medium">#{payment.bill_id}</p></div>
              <div><p className="text-sm text-gray-500">Meter</p><p className="font-medium">{payment.meter_number}</p></div>
              <div><p className="text-sm text-gray-500">Amount</p><p className="font-medium">₹{Number(payment.amount).toFixed(2)}</p></div>
              <div><p className="text-sm text-gray-500">Method</p><p className="font-medium">{payment.payment_method}</p></div>
              <div><p className="text-sm text-gray-500">Transaction ID</p><p className="font-medium">{payment.transaction_id || "—"}</p></div>
              <div><p className="text-sm text-gray-500">Payment Date</p><p className="font-medium">{payment.payment_date ? new Date(payment.payment_date).toLocaleString() : "—"}</p></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PaymentDetails;
