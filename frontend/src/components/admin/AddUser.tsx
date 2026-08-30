import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import API_URL from "../../config/api";

const AddUser = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create user");
        return;
      }

      setSuccess("User created successfully! Redirecting...");

      setName("");
      setEmail("");
      setPassword("");
      setRole("user");

      setTimeout(() => {
        navigate("/admin/users");
      }, 1000);
    } catch (err) {
      console.error("Create user error:", err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Add User</h1>
            <p className="mt-2 text-gray-600">Create a new EHMS user</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100 transition"
          >
            Back to Users
          </button>
        </div>

        <div className="mt-8 max-w-xl rounded-xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                required
                className="mt-2 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                className="mt-2 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                minLength={6}
                required
                className="mt-2 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "user" | "admin")
                }
                className="mt-2 w-full rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500 bg-white"
              >
                <option value="user">User (Customer)</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-500">{error}</p>
            )}

            {success && (
              <p className="text-sm font-medium text-green-600">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating User..." : "Create User"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddUser;