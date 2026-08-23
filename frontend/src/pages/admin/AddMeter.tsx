import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import API_URL from "../../config/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

const AddMeter = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [meterNumber, setMeterNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [meterType, setMeterType] = useState("electricity");
  const [installationDate, setInstallationDate] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleSubmit = async (
    e: SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!meterNumber || !userId) {
      setError("Meter number and user are required");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/meters`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            meter_number: meterNumber,
            user_id: Number(userId),
            meter_type: meterType,
            installation_date:
              installationDate || null,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create meter");
        return;
      }

      alert("Meter created successfully");

      navigate("/admin/meters");
    } catch (error) {
      console.error("Create meter error:", error);
      setError("Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Add Meter
            </h1>

            <p className="mt-2 text-gray-600">
              Register a new electricity meter
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/meters")}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            Back to Meters
          </button>
        </div>

        <div className="mt-8 max-w-xl rounded-xl border bg-white p-8 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium">
                Meter Number
              </label>

              <input
                type="text"
                value={meterNumber}
                onChange={(e) =>
                  setMeterNumber(e.target.value)
                }
                placeholder="Enter meter number"
                className="mt-2 w-full rounded-lg border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                User
              </label>

              <select
                value={userId}
                onChange={(e) =>
                  setUserId(e.target.value)
                }
                className="mt-2 w-full rounded-lg border p-2"
                disabled={loadingUsers}
              >
                <option value="">
                  {loadingUsers
                    ? "Loading users..."
                    : "Select user"}
                </option>

                {users.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">
                Meter Type
              </label>

              <select
                value={meterType}
                onChange={(e) =>
                  setMeterType(e.target.value)
                }
                className="mt-2 w-full rounded-lg border p-2"
              >
                <option value="electricity">
                  Electricity
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">
                Installation Date
              </label>

              <input
                type="date"
                value={installationDate}
                onChange={(e) =>
                  setInstallationDate(e.target.value)
                }
                className="mt-2 w-full rounded-lg border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "active"
                      | "inactive"
                  )
                }
                className="mt-2 w-full rounded-lg border p-2"
              >
                <option value="active">Active</option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Meter"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddMeter;