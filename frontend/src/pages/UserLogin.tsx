import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";

const UserLogin = () => {
  const navigate = useNavigate();
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
      setPasswordError("Must be equal to or greater than 6 characters");
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
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (data.user.role !== "user") {
        alert("This account does not have user access. Please use Admin Login.");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/user/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900">User Login</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-500">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <div>
            <span className="text-gray-600">Need admin access? </span>
            <Link
              to="/admin/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login as Admin
            </Link>
          </div>

          <div className="border-t pt-3">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate("/user/register")}
              className="font-semibold text-blue-600 hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
