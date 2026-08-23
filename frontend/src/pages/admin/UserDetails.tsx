import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(
          `/api/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load user");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Fetch user error:", error);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <button
          onClick={() => navigate("/admin/users")}
          className="mb-6 rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          ← Back to Users
        </button>

        <h1 className="text-3xl font-bold">
          User Details
        </h1>

        {loading && (
          <p className="mt-6 text-gray-500">
            Loading user...
          </p>
        )}

        {error && (
          <p className="mt-6 text-red-500">
            {error}
          </p>
        )}

      {user && (
  <div className="mt-6 max-w-lg rounded-xl border bg-white p-6 shadow-sm">
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">ID</p>
        <p className="font-medium">{user.id}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Name</p>
        <p className="font-medium">{user.name}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Email</p>
        <p className="font-medium">{user.email}</p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Role</p>
        <p className="font-medium">{user.role}</p>
      </div>
    </div>

    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
        className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Edit User
      </button>

      <button
        type="button"
        onClick={() => navigate("/admin/users")}
        className="rounded-lg border px-4 py-2 hover:bg-gray-100"
      >
        Back to Users
      </button>
    </div>
  </div>
)}
      </main>
    </div>
  );
};

export default UserDetails;