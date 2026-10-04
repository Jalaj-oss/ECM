import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import API_URL from "../config/api";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: string;
}

interface UserMeter {
  id: number;
  meter_number: string;
  meter_type: string;
  status: string;
}

interface UserBill {
  id: number;
  meter_id: number;
  billing_month: string;
  amount: number;
  due_date: string;
  status: string;
  units_consumed?: number;
}

interface UserPayment {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
}

interface UserComplaint {
  id: number;
  category: string;
  subject: string;
  status: string;
  created_at: string;
  admin_remarks?: string | null;
}

interface DashboardData {
  user: UserProfile;
  meters: UserMeter[];
  bills: UserBill[];
  payments: UserPayment[];
  complaints?: UserComplaint[];
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/user/login");
  };

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/user/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/user/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Failed to load dashboard data");
          return;
        }

        setData(result);
      } catch (err) {
        console.error("Error fetching user dashboard:", err);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const pendingBills = data?.bills?.filter((b) => b.status === "pending" || b.status === "unpaid") || [];
  const latestBill = data?.bills?.[0];
  const latestMeter = data?.meters?.[0];
  const latestComplaint = data?.complaints?.[0];

  const totalOutstanding = pendingBills.reduce((acc, b) => acc + Number(b.amount || 0), 0);

  const statCards = [
    {
      title: "My Meters",
      count: data?.meters?.length || 0,
      subtext: "Connected supplies",
      path: "/user/meters",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Electricity Bills",
      count: data?.bills?.length || 0,
      subtext: `${pendingBills.length} pending payment`,
      path: "/user/bills",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Payment History",
      count: data?.payments?.length || 0,
      subtext: "Receipts recorded",
      path: "/user/payments",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      title: "Complaints",
      count: data?.complaints?.length || 0,
      subtext: "Grievances & requests",
      path: "/user/complaints",
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <UserSidebar />

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">Consumer Self-Service</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight mt-1">
              Welcome back, {data?.user?.name || "Customer"} 👋
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Review current energy consumption, settle bills, and track service requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/user/profile")}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 bg-white border border-zinc-200/80 hover:border-red-300 hover:text-red-600 shadow-sm transition"
            >
              My Profile
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
        <div className="mt-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 sm:p-8 shadow-xl shadow-red-600/15">
          {/* Subtle background glow pattern */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute right-32 -bottom-16 w-48 h-48 bg-black/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-wider text-white mb-3">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h7v8l11-14h-8l0-6z" />
                </svg>
                <span>Consumer #{data?.user?.id || "---"} · Electricity Grid Active</span>
              </div>

              {totalOutstanding > 0 ? (
                <>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    Total Due: ₹{totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base mt-2 leading-relaxed">
                    You have {pendingBills.length} pending bill(s). Please clear dues on time to ensure uninterrupted power supply.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    All Bills Cleared · No Dues Pending
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base mt-2 leading-relaxed">
                    Thank you for prompt payments. Your power connection is in excellent standing.
                  </p>
                </>
              )}
            </div>

            {/* Secondary White Buttons on Red Surface */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/user/bills")}
                className="px-5 py-3 rounded-2xl bg-white text-red-600 hover:bg-red-50 font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>View & Pay Bills</span>
              </button>
              <button
                onClick={() => navigate("/user/complaints")}
                className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm font-semibold text-sm transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Raise Complaint</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="mt-8 p-12 text-center bg-white rounded-2xl border border-zinc-200">
            <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm font-medium text-zinc-500">Loading your account details and telemetry...</p>
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

        {!loading && !error && data && (
          <>
            {/* 4 Summary Stat Cards */}
            <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                    <h3 className="text-3xl font-black text-zinc-900 tracking-tight">
                      {card.count}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-zinc-500">
                      {card.subtext}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-red-600 group-hover:translate-x-0.5 transition-transform">
                    <span>View Details</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 2x2 Feature Section Cards */}
            <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Card 1: Customer Profile & Service Info */}
              <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <h2 className="text-lg font-bold text-zinc-900">Consumer Account Details</h2>
                    </div>
                    <button
                      onClick={() => navigate("/user/profile")}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Edit Profile →
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-400">Account Holder</p>
                      <p className="font-bold text-zinc-900 mt-1">{data.user.name || "Customer"}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-400">Registered Email</p>
                      <p className="font-bold text-zinc-900 mt-1 truncate">{data.user.email || "Not specified"}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-400">Mobile Number</p>
                      <p className="font-bold text-zinc-900 mt-1">{data.user.phone || "Not provided"}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50/70 border border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-400">Installation Address</p>
                      <p className="font-bold text-zinc-900 mt-1 truncate">{data.user.address || "Main Connection"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span>Consumer Role: <strong className="text-zinc-700 uppercase">{data.user.role}</strong></span>
                  <span className="text-emerald-600 font-semibold">● Connection Verified</span>
                </div>
              </section>

              {/* Card 2: Latest Bill & Settlement */}
              <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <h2 className="text-lg font-bold text-zinc-900">Latest Monthly Bill</h2>
                    </div>
                    <button
                      onClick={() => navigate("/user/bills")}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      All Bills ({data.bills?.length || 0}) →
                    </button>
                  </div>

                  {latestBill ? (
                    <div className="mt-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                        <div>
                          <p className="text-xs font-semibold text-zinc-400">Billing Cycle: {latestBill.billing_month}</p>
                          <p className="text-2xl font-black text-zinc-900 mt-1">
                            ₹{Number(latestBill.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">Due Date: {latestBill.due_date}</p>
                        </div>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                            latestBill.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {latestBill.status}
                        </span>
                      </div>

                      {latestBill.status !== "paid" ? (
                        <div className="mt-4 flex items-center justify-end">
                          <button
                            onClick={() => navigate("/user/bills")}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2"
                          >
                            <span>Pay Bill Online</span>
                            <span>→</span>
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>This bill has been settled in full. Thank you!</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-sm">
                      No billing records available yet.
                    </div>
                  )}
                </div>
              </section>

              {/* Card 3: Electricity Supply Meter */}
              <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <h2 className="text-lg font-bold text-zinc-900">Active Supply Meter</h2>
                    </div>
                    <button
                      onClick={() => navigate("/user/meters")}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Meter Details →
                    </button>
                  </div>

                  {latestMeter ? (
                    <div className="mt-4 space-y-3">
                      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-zinc-400">Meter Serial Number</p>
                          <p className="text-lg font-black tracking-wider text-zinc-900 font-mono mt-0.5">
                            {latestMeter.meter_number}
                          </p>
                          <p className="text-xs text-zinc-500 capitalize mt-0.5">Supply Type: {latestMeter.meter_type}</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="capitalize">{latestMeter.status || "Active"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-sm">
                      No meter assigned to this account yet.
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span>Smart telemetry sync: Automatic</span>
                  <span className="font-semibold text-red-600">Grid Connected</span>
                </div>
              </section>

              {/* Card 4: Complaints & Grievance Status */}
              <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <h2 className="text-lg font-bold text-zinc-900">Service Grievances</h2>
                    </div>
                    <button
                      onClick={() => navigate("/user/complaints")}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      + Raise Complaint
                    </button>
                  </div>

                  {latestComplaint ? (
                    <div className="mt-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Ticket #{latestComplaint.id} · {latestComplaint.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            latestComplaint.status === "resolved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : latestComplaint.status === "in_progress"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : latestComplaint.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {latestComplaint.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-zinc-900 mt-2 truncate">
                        {latestComplaint.subject}
                      </p>
                      {latestComplaint.admin_remarks && (
                        <p className="text-xs text-zinc-500 mt-1 italic">
                          Admin note: "{latestComplaint.admin_remarks}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-sm">
                      <p>No active complaints registered.</p>
                      <p className="text-xs text-zinc-400 mt-1">Encountering voltage issues or billing disputes? File a ticket.</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                  <span>Support SLA: &lt; 24h resolution</span>
                  <button
                    onClick={() => navigate("/user/complaints")}
                    className="font-bold text-red-600 hover:underline"
                  >
                    View All Grievances →
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
