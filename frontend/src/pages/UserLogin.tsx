import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import API_URL from "../config/api";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setEmailError("Email is required");
    } else if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email");
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
    } else if (password.length < 6) {
      setPasswordError("Must be equal to or greater than 6 digits");
    } else {
      setPasswordError("");
    }

    if (!email || !password || !emailPattern.test(email) || password.length < 6) {
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

      if (data.user.role !== "user") {
        alert("This account does not have user access");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/user/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-96 rounded-xl border bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">User Login</h1>
        <p className="mt-2 text-center text-gray-600">For User access</p>
        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label className="block text-sm font-medium">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              placeholder="Enter Email"
              className="mt-2 w-full rounded-lg border p-2"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-500">{emailError}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Enter Password"
              className="mt-2 w-full rounded-lg border p-2"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600"
          >
            Login
          </button>

          {/* Secondary option: Admin access */}
          <Link
            to="/admin/login"
            className="mt-4 block text-center text-sm text-blue-600 hover:underline"
          >
            Login as Admin
          </Link>

          <Link to="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            ← Back to account type selection
          </Link>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Don't have an account?</p>
          <button
            type="button"
            onClick={() => navigate("/user/register")}
            className="mt-2 text-blue-600 hover:underline font-medium"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;