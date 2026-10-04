import { Link, useLocation, useNavigate } from "react-router-dom";

const UserSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    {
      to: "/user/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: "/user/profile",
      label: "My Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      to: "/user/meters",
      label: "My Meter",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      to: "/user/bills",
      label: "My Bills",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      to: "/user/payments",
      label: "My Payments",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      to: "/user/complaints",
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
    navigate("/user/login");
  };

  return (
    <aside className="w-72 min-h-screen bg-white border-r border-zinc-200/80 flex flex-col justify-between p-6 select-none shrink-0 shadow-sm">
      <div>
        {/* Brand Header with Red Primary Icon & White Lightning */}
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
                User
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-400">Consumer Self-Service</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="mt-6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Navigation
          </p>
          <nav className="space-y-1.5">
            {links.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== "/user/dashboard" && location.pathname.startsWith(item.to));
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

      {/* Footer Support Card & Logout */}
      <div className="pt-6 border-t border-zinc-100 space-y-3">
        <div className="p-3.5 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-100/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="text-xs font-bold text-red-900">24/7 Helpline</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Need urgent power support or report outage? Call toll-free 1800-POWER.
          </p>
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

export default UserSidebar;
