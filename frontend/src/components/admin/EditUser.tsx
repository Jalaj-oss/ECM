import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import API_URL from "../../config/api";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load user");
          return;
        }

        setName(data.user.name);
        setEmail(data.user.email);
        setRole(data.user.role);
      } catch (err) {
        console.error("Fetch user error:", err);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email) {
      setError("Name and email are required");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update user");
        return;
      }

      setSuccess("User updated successfully! Redirecting...");

      setTimeout(() => {
        navigate(`/admin/users/${id}`);
      }, 1000);
    } catch (err) {
      console.error("Update user error:", err);
      setError("Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <p className="text-gray-500">Loading user details...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit User</h1>
            <p className="mt-2 text-gray-600">Update user information</p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/admin/users/${id}`)}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100 transition"
          >
            Back to User
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
                  setRole(e.target.value as "admin" | "user")
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
              disabled={saving}
              className="w-full rounded-lg bg-blue-500 py-3 font-medium text-white hover:bg-blue-600 transition disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditUser;