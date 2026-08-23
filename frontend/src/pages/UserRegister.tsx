import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config/api";

const UserRegister = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Account created successfully. Redirecting to login...");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/user/login"), 1200);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="mt-2 text-gray-600">
          Create your EHMS user account
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Confirm your password"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">Already have an account?</p>
          <Link
            to="/user/login"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
