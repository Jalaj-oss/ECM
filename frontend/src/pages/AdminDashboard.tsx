import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import API_URL from "../config/api";

interface SummaryData {
  users: number;
  meters: number;
  activeMeters: number;
  bills: number;
  pendingBills: number;
  paidBills: number;
  overdueBills: number;
  payments: number;
  paymentCount: number;
  totalBilled: number;
  totalPaidBills: number;
  outstandingAmount: number;
}

interface DashboardReport {
  summary: SummaryData;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/reports/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Failed to load dashboard data");
          return;
        }

        // Ensure summary key exists
        const normalizedData: DashboardReport = {
          summary: result.summary || {
            users: result.users || 0,
            meters: result.meters || 0,
            activeMeters: result.activeMeters || 0,
            bills: result.bills || 0,
            pendingBills: result.pendingBills || 0,
            paidBills: result.paidBills || 0,
            overdueBills: result.overdueBills || 0,
            payments: result.payments || 0,
            paymentCount: result.paymentCount || result.payments || 0,
            totalBilled: result.totalBilled || 0,
            totalPaidBills: result.totalPaidBills || 0,
            outstandingAmount: result.outstandingAmount || 0,
          },
          recentBills: result.recentBills || [],
          recentPayments: result.recentPayments || [],
        };

        setData(normalizedData);
      } catch (err) {
        console.error("Error fetching admin dashboard stats:", err);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  const summary = data?.summary;

  const statCards = [
    {
      title: "Total Users",
      value: summary ? summary.users : 0,
      subtext: "Registered Customers",
      path: "/admin/users",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Meters",
      value: summary ? summary.meters : 0,
      subtext: `${summary ? summary.activeMeters : 0} Active Meters`,
      path: "/admin/meters",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Pending Bills",
      value: summary ? summary.pendingBills : 0,
      subtext: `₹${summary ? Number(summary.outstandingAmount).toFixed(2) : "0.00"} Pending`,
      path: "/admin/bills",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Total Payments",
      value: summary ? summary.paymentCount : 0,
      subtext: `₹${summary ? Number(summary.totalPaidBills).toFixed(2) : "0.00"} Collected`,
      path: "/admin/payments",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome to the EHMS Admin Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {loading && (
          <div className="mt-8 text-gray-500 font-medium">
            Loading real-time dashboard counts...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Dashboard cards */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat) => (
                <div
                  key={stat.title}
                  onClick={() => navigate(stat.path)}
                  className="cursor-pointer rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">{stat.value}</h2>
                  <p className="mt-2 text-xs font-semibold text-gray-500">
                    {stat.subtext}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Overview Section */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Recent Bills */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Recent Bills</h2>
                  <button
                    onClick={() => navigate("/admin/bills")}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {data?.recentBills && data.recentBills.length > 0 ? (
                  <div className="space-y-3">
                    {data.recentBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between border-b pb-3"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            Bill #{bill.id} · {bill.user_name || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Meter: {bill.meter_number || "N/A"} · Month: {bill.billing_month}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            ₹{Number(bill.amount).toFixed(2)}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${
                              bill.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : bill.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {bill.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent bills found.</p>
                )}
              </div>

              {/* Recent Payments */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Recent Payments</h2>
                  <button
                    onClick={() => navigate("/admin/payments")}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {data?.recentPayments && data.recentPayments.length > 0 ? (
                  <div className="space-y-3">
                    {data.recentPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between border-b pb-3"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            Payment #{payment.id} · {payment.user_name || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Method: {payment.payment_method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            ₹{Number(payment.amount).toFixed(2)}
                          </p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold capitalize">
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No recent payments recorded.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;