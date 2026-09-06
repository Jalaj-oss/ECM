import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

interface LoginProps {
  initialMode?: "user" | "admin";
}

const UserLogin = ({ initialMode = "user" }: LoginProps) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"user" | "admin">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (mode === "user" && data.user.role !== "user") {
        alert("This account does not have user access. Please switch to Admin Login.");
        return;
      }

      if (mode === "admin" && data.user.role !== "admin") {
        alert("This account does not have admin access. Please switch to User Login.");
        return;
      }

      localStorage.setItem("token", data.token);

      if (mode === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#94aebd] via-[#c2d2dc] to-[#e1e4da] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-gradient-to-b from-[#b8c9d4] via-[#d5e0e6] to-[#e9ece4] p-6 shadow-2xl md:p-8">
        
        {/* Top Logo - AMIZONE / EHMS Style */}
        <div className="text-center pt-2 pb-4">
          <h1 className="inline-flex items-center gap-1 text-4xl font-extrabold tracking-wider text-[#1c385c]">
            <span>AMI</span>
            <span className="relative text-[#0066cc] skew-x-[-12deg] inline-block font-black">
              Z
            </span>
            <span>ONE</span>
          </h1>
          <p className="text-[11px] font-semibold tracking-widest text-slate-600 uppercase mt-0.5">
            EHMS Power Portal
          </p>
        </div>

        {/* Title and Mode Toggle Option */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-black text-[#388e3c] tracking-wide">
              LOGIN
            </span>
            <span className="text-sm font-bold text-[#1c385c] tracking-wider uppercase">
              {mode === "user" ? "STUDENT | PARENT" : "ADMIN | PORTAL"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "user" ? "admin" : "user");
              setEmailError("");
              setPasswordError("");
            }}
            className="mt-2 text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline transition cursor-pointer"
          >
            {mode === "user"
              ? "Click here for admin login"
              : "Click here for user login"}
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Username Input */}
          <div>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-500">
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="User Name"
                className="w-full rounded-full border border-gray-300 bg-[#ebedf0]/90 py-3.5 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-500 outline-none shadow-inner focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            {emailError && (
              <p className="mt-1 pl-4 text-xs font-medium text-red-600">
                {emailError}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-500">
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Password"
                className="w-full rounded-full border border-gray-300 bg-[#ebedf0]/90 py-3.5 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-500 outline-none shadow-inner focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            {passwordError && (
              <p className="mt-1 pl-4 text-xs font-medium text-red-600">
                {passwordError}
              </p>
            )}
          </div>

          {/* Cloudflare Security Success Badge */}
          <div className="rounded-xl border border-gray-200 bg-white/95 p-3 shadow-sm flex items-center justify-between my-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs shadow-sm">
                ✓
              </span>
              <span className="text-sm font-bold text-slate-800">
                Success!
              </span>
            </div>
            <div className="text-right text-[10px] text-gray-400 font-medium">
              <div className="flex items-center gap-1 font-bold text-[#f38020] text-xs justify-end">
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                </svg>
                CLOUDFLARE
              </div>
              <span>Privacy · Help</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#4caf50] py-3.5 text-center text-base font-extrabold text-white shadow-md hover:bg-[#43a047] active:scale-[0.99] transition disabled:opacity-50 uppercase tracking-wider"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        {/* Links below form */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600 font-medium">
            Forgot Username / Password?
          </p>

          {mode === "user" && (
            <div className="mt-3">
              <p className="text-xs text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/user/register")}
                  className="text-blue-700 font-semibold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Bottom Card / Banner matching image */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#002147] via-[#003366] to-[#001833] p-5 text-white shadow-xl border border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 font-black text-[#002147] text-xs shadow tracking-tighter">
              AMITY
            </div>
            <div>
              <h4 className="text-xs font-black tracking-wider text-yellow-400 uppercase">
                AMITY UNIVERSITY
              </h4>
              <p className="text-[10px] text-blue-200 font-semibold tracking-wide">
                INDIA'S #1 RANKED PRIVATE UNIVERSITY
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-extrabold text-white leading-snug tracking-wide">
            EHMS ELECTRICITY CHARGE MANAGEMENT SYSTEM
            <br />
            <span className="text-yellow-300 font-normal text-[11px]">
              11 years in a row · Safe & Secure Power Portal
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default UserLogin;
