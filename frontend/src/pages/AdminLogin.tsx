import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import API_URL from "../config/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const emailpattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setEmailError("Email is required");
    } else if (!emailpattern.test(email)) {
      setEmailError("Please enter a valid email");
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }

    if (!email || !password || !emailpattern.test(email) || password.length < 6) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      if (data.user.role !== "admin") {
        alert("Account type not matched! Try different login");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar — same as Login.tsx */}
      <nav className="flex h-16 items-center justify-between bg-blue-500 px-8 text-white">
        <span className="text-lg font-bold tracking-wide">EHMS</span>
      </nav>

      {/* Two-side split layout */}
      <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
        {/* Left: brand panel */}
        <div className="relative flex flex-col justify-center overflow-hidden bg-[#0B3D91] px-8 py-16 text-white md:w-1/2 md:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

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
            <h1 className="mt-4 text-7xl font-extrabold leading-tight md:text-5xl">
              ECM
            </h1>
            <p className="mt-4 text-base text-blue-100">
              Electricity Bill Management System
            </p>
          </div>
        </div>

        {/* Right: Admin Login form */}
        <div className="flex flex-1 items-center justify-center bg-[#F5F8FC] px-6 py-16">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
            <div className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B3D91]/10 text-[#0B3D91]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                </svg>
              </span>
              <h1 className="mt-4 text-2xl font-bold text-slate-900">Admin Login</h1>
              <p className="mt-1 text-sm text-slate-500">For Admin access</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder="Enter your email"
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-[#0B3D91]/30 focus:border-[#0B3D91] ${
                    emailError ? "border-red-400" : "border-slate-300"
                  }`}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-red-500">{emailError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter your password"
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-[#0B3D91]/30 focus:border-[#0B3D91] ${
                    passwordError ? "border-red-400" : "border-slate-300"
                  }`}
                />
                {passwordError && (
                  <p className="mt-1.5 text-xs text-red-500">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#0B3D91] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3480]"
              >
                Login
              </button>

              {/* Secondary text link back to the user login */}
              <Link
                to="/user/login"
                className="block text-center text-sm font-medium text-[#0B3D91] hover:underline"
              >
                Login as User
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;