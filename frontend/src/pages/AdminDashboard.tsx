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
  complaints?: number;
  pendingComplaints?: number;
  resolvedComplaints?: number;
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
  recentComplaints?: Array<{
    id: number;
    category: string;
    subject: string;
    status: string;
    created_at: string;
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
            complaints: result.complaints || 0,
            pendingComplaints: result.pendingComplaints || 0,
            resolvedComplaints: result.resolvedComplaints || 0,
          },
          recentBills: result.recentBills || [],
          recentPayments: result.recentPayments || [],
          recentComplaints: result.recentComplaints || [],
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
      title: "Total Consumers",
      value: summary ? summary.users : 0,
      subtext: "Active accounts",
      path: "/admin/users",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Connected Meters",
      value: summary ? summary.meters : 0,
      subtext: `${summary ? summary.activeMeters : 0} online & active`,
      path: "/admin/meters",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Pending Bills",
      value: summary ? summary.pendingBills : 0,
      subtext: `₹${summary ? Number(summary.outstandingAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"} pending`,
      path: "/admin/bills",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Payments Received",
      value: summary ? summary.paymentCount : 0,
      subtext: `₹${summary ? Number(summary.totalPaidBills).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"} collected`,
      path: "/admin/payments",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Grievances",
      value: summary ? (summary.complaints ?? 0) : 0,
      subtext: `${summary ? (summary.pendingComplaints ?? 0) : 0} pending action`,
      path: "/admin/complaints",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    { label: "+ Create Bill", path: "/admin/bills", desc: "Issue new monthly statement" },
    { label: "+ Register Meter", path: "/admin/meters", desc: "Attach meter to consumer" },
    { label: "+ Add Consumer", path: "/admin/users", desc: "Enroll new customer account" },
    { label: "View Reports", path: "/admin/reports", desc: "Financial & consumption audits" },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">System Admin Control</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight mt-1">
              Admin Overview & Analytics
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Live power distribution, billing management, and customer support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/reports")}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 bg-white border border-zinc-200/80 hover:border-red-300 hover:text-red-600 shadow-sm transition"
            >
              Export Reports
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/25 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Primary Red Banner with White Secondary Elements */}
        <div className="mt-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white p-6 sm:p-8 shadow-xl shadow-red-600/15">
          {/* Subtle background glow pattern */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute right-32 -bottom-16 w-48 h-48 bg-black/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-wider text-white mb-3">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h7v8l11-14h-8l0-6z" />
                </svg>
                <span>EHMS Central Grid Monitoring</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Electricity Billing & Operations Hub
              </h2>
              <p className="text-white/85 text-sm sm:text-base mt-2 leading-relaxed">
                Control consumer billing cycles, verify meter telemetry, and resolve service tickets in real time.
              </p>
            </div>

            {/* Secondary White Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/admin/bills")}
                className="px-5 py-3 rounded-2xl bg-white text-red-600 hover:bg-red-50 font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Generate Bill</span>
              </button>
              <button
                onClick={() => navigate("/admin/complaints")}
                className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm font-semibold text-sm transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Complaints ({summary?.pendingComplaints ?? 0})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="mt-8 p-12 text-center bg-white rounded-2xl border border-zinc-200">
            <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm font-medium text-zinc-500">Loading grid statistics and recent records...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 5 KPI Metric Cards */}
            <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {statCards.map((card) => (
                <div
                  key={card.title}
                  onClick={() => navigate(card.path)}
                  className="group cursor-pointer rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-red-600 transition-colors">
                      {card.title}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100/70 flex items-center justify-center group-hover:scale-105 group-hover:bg-red-600 group-hover:text-white transition-all">
                      <div className="group-hover:brightness-0 group-hover:invert">
                        {card.icon}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
                      {card.value}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-zinc-500">
                      {card.subtext}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-red-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Manage</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Shortcuts Bar */}
            <div className="mt-6 p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Quick Shortcuts</span>
                <span className="text-xs font-medium text-zinc-400">Click to perform action</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/70 hover:bg-red-50/60 hover:border-red-200 text-left transition-all group"
                  >
                    <p className="text-sm font-bold text-zinc-900 group-hover:text-red-700">{action.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{action.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity Sections (3-Column Layout) */}
            <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* 1. Recent Bills */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <h3 className="font-bold text-zinc-900 text-base">Recent Bills</h3>
                    </div>
                    <button
                      onClick={() => navigate("/admin/bills")}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  {data?.recentBills && data.recentBills.length > 0 ? (
                    <div className="space-y-3">
                      {data.recentBills.slice(0, 5).map((bill) => (
                        <div
                          key={bill.id}
                          className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-100 flex items-center justify-between hover:bg-zinc-100/60 transition"
                        >
                          <div>
                            <p className="text-sm font-bold text-zinc-900">
                              #{bill.id} · {bill.user_name || "Customer"}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {bill.billing_month} · Meter: {bill.meter_number || "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-zinc-900">
                              ₹{Number(bill.amount).toFixed(2)}
                            </p>
                            <span
                              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                bill.status === "paid"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : bill.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {bill.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-sm">
                      No recent bills found.
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Recent Payments */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <h3 className="font-bold text-zinc-900 text-base">Recent Payments</h3>
                    </div>
                    <button
                      onClick={() => navigate("/admin/payments")}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  {data?.recentPayments && data.recentPayments.length > 0 ? (
                    <div className="space-y-3">
                      {data.recentPayments.slice(0, 5).map((pmt) => (
                        <div
                          key={pmt.id}
                          className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-100 flex items-center justify-between hover:bg-zinc-100/60 transition"
                        >
                          <div>
                            <p className="text-sm font-bold text-zinc-900">
                              Payment #{pmt.id}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {pmt.user_name || "Customer"} · {pmt.payment_method}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-600">
                              +₹{Number(pmt.amount).toFixed(2)}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {pmt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-sm">
                      No recent payments found.
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Recent Complaints */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                      <h3 className="font-bold text-zinc-900 text-base">Consumer Grievances</h3>
                    </div>
                    <button
                      onClick={() => navigate("/admin/complaints")}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Resolve All →
                    </button>
                  </div>

                  {data?.recentComplaints && data.recentComplaints.length > 0 ? (
                    <div className="space-y-3">
                      {data.recentComplaints.slice(0, 5).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => navigate("/admin/complaints")}
                          className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-100 flex items-center justify-between hover:bg-red-50/50 hover:border-red-200 cursor-pointer transition"
                        >
                          <div className="max-w-[170px]">
                            <p className="text-sm font-bold text-zinc-900 truncate">
                              {c.subject}
                            </p>
                            <p className="text-xs text-zinc-500 mt-0.5 truncate">
                              {c.user_name || "Customer"} · {c.category}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                c.status === "resolved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : c.status === "in_progress"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : c.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {c.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-sm">
                      No complaints registered.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;