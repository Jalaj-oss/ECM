import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";
import API_URL from "../../config/api";

interface Bill {
  id: number;
  meter_id: number;
  billing_month: string;
  previous_reading: number;
  current_reading: number;
  units_consumed: number;
  amount: number;
  due_date: string;
  status: string;
}

const UserBillDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBill = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/user/login");

      try {
        const res = await fetch(`${API_URL}/api/user/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) setError(data.message || "Bill not found");
        else setBill(data.bill);
      } catch {
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id, navigate]);

  const handlePayBill = async () => {
    if (!bill || String(bill.status).toLowerCase() === "paid") return;

    try {
      setPaying(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate("/user/login");

      const response = await fetch(
        `${API_URL}/api/user/bills/${bill.id}/checkout`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Unable to start online payment");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error("Pay bill error:", err);
      alert("Unable to connect to server");
    } finally {
      setPaying(false);
    }
  };

  const isPaid = bill && String(bill.status).toLowerCase() === "paid";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 p-8">
        <button
          onClick={() => navigate("/user/bills")}
          className="mb-6 rounded-lg border px-4 py-2 hover:bg-gray-100 transition"
        >
          ← Back to Bills
        </button>

        <h1 className="text-3xl font-bold">Bill Details</h1>

        {loading ? (
          <p className="mt-6 text-gray-500">Loading bill details...</p>
        ) : error ? (
          <p className="mt-6 text-red-500">{error}</p>
        ) : (
          bill && (
            <div className="mt-6 max-w-xl rounded-xl border bg-white p-6 shadow-sm space-y-4">
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Bill ID</span>
                <span className="font-bold">#{bill.id}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Billing Month</span>
                <span>{bill.billing_month}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Previous Reading</span>
                <span>{bill.previous_reading}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Current Reading</span>
                <span>{bill.current_reading}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Units Consumed</span>
                <span className="font-semibold">{bill.units_consumed} kWh</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Amount Due</span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{Number(bill.amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-500">Due Date</span>
                <span>{bill.due_date}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-500">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {bill.status}
                </span>
              </div>

              {!isPaid && (
                <div className="pt-4">
                  <button
                    onClick={handlePayBill}
                    disabled={paying}
                    className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {paying ? "Redirecting to Stripe..." : "Pay Bill with Card (Stripe)"}
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default UserBillDetails;
