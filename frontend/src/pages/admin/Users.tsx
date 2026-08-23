import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import API_URL from "../../config/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

const Users = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load users");
          return;
        }

        setUsers(data.users);
      } catch (error) {
        console.error("Fetch users error:", error);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>

            <p className="mt-2 text-gray-600">Manage EHMS users</p>
          </div>

      <div className="flex gap-3">
  <button
    type="button"
    onClick={() => navigate("/admin/users/add")}
    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
  >
    Add User
  </button>

  <button
    type="button"
    onClick={() => navigate("/admin/dashboard")}
    className="rounded-lg border px-4 py-2 hover:bg-gray-100"
  >
    Back to Dashboard
  </button>
</div>
</div>
        <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading users...</p>
          ) : error ? (
            <p className="p-6 text-center text-red-500">{error}</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No users found</p>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Name
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="px-6 py-4">{user.name}</td>

                    <td className="px-6 py-4">{user.email}</td>

                    <td className="px-6 py-4">{user.role}</td>

                   
   <td className="px-6 py-4">
  <div className="flex gap-4">
    <button
      type="button"
      onClick={() => navigate(`/admin/users/${user.id}`)}
      className="text-blue-600 hover:underline"
    >
      View
    </button>

    <button
      type="button"
      onClick={async () => {
        const confirmed = window.confirm(
          `Are you sure you want to delete ${user.name}?`
        );

        if (!confirmed) {
          return;
        }

        try {
          const token = localStorage.getItem("token");

          if (!token) {
            navigate("/admin/login");
            return;
          }

          const response = await fetch(
            `${API_URL}/api/users/${user.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            alert(data.message || "Failed to delete user");
            return;
          }

          alert("User deleted successfully");

          setUsers((currentUsers) =>
            currentUsers.filter(
              (currentUser) => currentUser.id !== user.id
            )
          );
        } catch (error) {
          console.error("Delete user error:", error);
          alert("Unable to connect to server");
        }
      }}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  </div>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;
