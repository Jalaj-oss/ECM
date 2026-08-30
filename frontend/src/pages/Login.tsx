import { Link } from "react-router-dom"

const Login = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar — flexbox/classes untouched, only added a wordmark inside */}
      <nav className="flex h-16 items-center justify-between bg-blue-500 px-8 text-white">
        <span className="text-lg font-bold tracking-wide">EHMS</span>
      </nav>

      {/* Two-side split login layout */}
      <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
        {/* Left: brand panel */}
        <div className="relative flex flex-col justify-center overflow-hidden bg-[#0B3D91] px-8 py-16 text-white md:w-1/2 md:px-16">
          {/* dot-grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* signature pulse-line motif */}
          <style>{`
            @keyframes pulse-dash {
              0% { stroke-dashoffset: 500; }
              60% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -500; }
            }
          `}</style>
          <svg
            className="pointer-events-none absolute bottom-0 left-0 w-full text-[#2E6BE6]/40"
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0 60 L60 60 L80 20 L100 90 L120 60 L400 60"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 500, strokeDashoffset: 500 }}
              className="motion-safe:animate-[pulse-dash_3.5s_ease-in-out_infinite] motion-reduce:animate-none"
            />
          </svg>

          <div className="relative z-10 max-w-md">
            
            <h1 className="mt-4 text-7xl font-extrabold justify-center leading-tight md:text-5xl">
              ECM
            </h1>
            <p className="mt-4 text-base text-blue-100">
            Electricity Bill Management System
            </p>
          </div>
        </div>

        {/* Right: account selection panel */}
        <div className="flex flex-1 flex-col items-center justify-center bg-[#F5F8FC] px-8 py-16">
          <div className="w-full max-w-md">
            <h2 className="text-center text-2xl font-bold text-[#0B3D91]">
              Select Your Account Type
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Choose how you'd like to sign in
            </p>

            <div className="mt-10 space-y-5">
              {/* Admin */}
              <div className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B3D91]/10 text-[#0B3D91]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">Admin</h3>
                    <p className="text-sm text-slate-500">For admin login</p>
                  </div>
                </div>
                <Link
                  to="/admin/login"
                  className="rounded-lg bg-[#0B3D91] px-4 py-2 text-sm font-medium text-white transition group-hover:bg-[#0a3480]"
                >
                  Continue
                </Link>
              </div>

              {/* User */}
              <div className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">User</h3>
                    <p className="text-sm text-slate-500">
                      For customer login
                    </p>
                  </div>
                </div>
                <Link
                  to="/user/login"
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition group-hover:bg-[#1d4ed8]"
                >
                  Continue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login