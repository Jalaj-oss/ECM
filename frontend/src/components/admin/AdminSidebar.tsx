import { Link, useLocation, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: "/admin/users",
      label: "Users",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      to: "/admin/meters",
      label: "Meters",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      to: "/admin/bills",
      label: "Bills",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      to: "/admin/payments",
      label: "Payments",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      to: "/admin/reports",
      label: "Reports",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      to: "/admin/complaints",
      label: "Complaints",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <aside className="w-72 min-h-screen bg-white border-r border-zinc-200/80 flex flex-col justify-between p-6 select-none shrink-0 shadow-sm">
      <div>
        {/* Brand Header with Red Primary Icon & White Accent */}
        <div className="flex items-center gap-3.5 pb-6 border-b border-zinc-100">
          <div className="w-11 h-11 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/30">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h7v8l11-14h-8l0-6z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-zinc-900">EHMS</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-700 border border-red-200/70">
                Admin
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-400">Electricity Management System</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="mt-6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== "/admin/dashboard" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                      : "text-zinc-600 hover:text-red-700 hover:bg-red-50/70"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-zinc-400 group-hover:text-red-600"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Area with System Status & Logout */}
      <div className="pt-6 border-t border-zinc-100 space-y-3">
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-zinc-600">Grid Server Live</span>
          </div>
          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
            PROD
          </span>
        </div>

        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 hover:text-red-700 hover:bg-red-50 border border-zinc-200/80 hover:border-red-200 transition-all duration-150"
        >
          <svg className="w-4 h-4 text-zinc-500 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;