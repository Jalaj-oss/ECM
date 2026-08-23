import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import API_URL from "../../config/api";

interface Summary {
  users: number;
  meters: number;
  activeMeters: number;
  bills: number;
  pendingBills: number;
  paidBills: number;
  overdueBills: number;
  totalBilled: number;
  totalPaidBills: number;
  outstandingAmount: number;
  totalPayments: number;
  paymentCount: number;
}

interface ReportData {
  summary: Summary;
  recentBills: Array<{
    id: number;
    billing_month: string;
    amount: number;
    status: string;
    user_name: string;
    meter_number: string;
  }>;
  recentPayments: Array<{
    id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    status: string;
    user_name: string;
  }>;
}

const Reports = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ReportData | null>(null);
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
          `${API_URL}/api/reports/summary`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Failed to load reports");
          return;
        }

        setData(result);
      } catch (error) {
        console.error("Fetch report error:", error);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="mt-2 text-gray-600">EHMS administration summary</p>
          </div>
          <button type="button" onClick={() => navigate("/admin/dashboard")} className="rounded-lg border px-4 py-2 hover:bg-gray-100">
            Back to Dashboard
          </button>
        </div>

        {loading && <p className="mt-8 text-gray-500">Loading reports...</p>}
        {error && <p className="mt-8 text-red-500">{error}</p>}

        {data && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Users</p>
                <p className="mt-2 text-3xl font-bold">{data.summary.users}</p>
              </div>
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Meters</p>
                <p className="mt-2 text-3xl font-bold">{data.summary.meters}</p>
                <p className="mt-1 text-sm text-gray-500">{data.summary.activeMeters} active</p>
              </div>
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Bills</p>
                <p className="mt-2 text-3xl font-bold">{data.summary.bills}</p>
                <p className="mt-1 text-sm text-gray-500">{data.summary.paidBills} paid</p>
              </div>
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Payments</p>
                <p className="mt-2 text-3xl font-bold">{data.summary.paymentCount}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Total Billed</p>
                <p className="mt-2 text-2xl font-bold">₹{data.summary.totalBilled.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="mt-2 text-2xl font-bold">₹{data.summary.totalPaidBills.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="mt-2 text-2xl font-bold">₹{data.summary.outstandingAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Recent Bills</h2>
                <div className="mt-4 space-y-3">
                  {data.recentBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">Bill #{bill.id} · {bill.user_name}</p>
                        <p className="text-sm text-gray-500">{bill.meter_number} · {bill.status}</p>
                      </div>
                      <p className="font-medium">₹{Number(bill.amount).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Recent Payments</h2>
                <div className="mt-4 space-y-3">
                  {data.recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">Payment #{payment.id} · {payment.user_name}</p>
                        <p className="text-sm text-gray-500">{payment.payment_method} · {payment.status}</p>
                      </div>
                      <p className="font-medium">₹{Number(payment.amount).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;
