import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface Meter {
  id: number;
  meter_number: string;
  user_id: number;
  meter_type: string;
  installation_date: string | null;
  status: "active" | "inactive";
}

const EditMeter = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);

  const [meterNumber, setMeterNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [meterType, setMeterType] = useState("electricity");
  const [installationDate, setInstallationDate] =
    useState("");
  const [status, setStatus] =
    useState<"active" | "inactive">("active");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const [meterResponse, usersResponse] =
          await Promise.all([
            fetch(
              `/api/meters/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),

            fetch(
              "/api/users",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),
          ]);

        const meterData =
          await meterResponse.json();

        const usersData =
          await usersResponse.json();

        if (!meterResponse.ok) {
          setError(
            meterData.message ||
              "Failed to load meter"
          );
          return;
        }

        if (!usersResponse.ok) {
          setError(
            usersData.message ||
              "Failed to load users"
          );
          return;
        }

        const meter: Meter = meterData.meter;

        setMeterNumber(meter.meter_number);
        setUserId(String(meter.user_id));
        setMeterType(meter.meter_type);
        setInstallationDate(
          meter.installation_date || ""
        );
        setStatus(meter.status);

        setUsers(usersData.users);
      } catch (error) {
        console.error(
          "Load edit meter error:",
          error
        );
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (
    e: SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!meterNumber || !userId) {
      setError(
        "Meter number and user are required"
      );
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
        `/api/meters/${id}`,
        {
          method: "PUT",
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
        setError(
          data.message || "Failed to update meter"
        );
        return;
      }

      alert("Meter updated successfully");

      navigate(`/admin/meters/${id}`);
    } catch (error) {
      console.error(
        "Update meter error:",
        error
      );
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
          <p className="text-gray-500">
            Loading meter...
          </p>
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
            <h1 className="text-3xl font-bold">
              Edit Meter
            </h1>

            <p className="mt-2 text-gray-600">
              Update meter information
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/admin/meters/${id}`)
            }
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            Back to Meter
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
              >
                <option value="">
                  Select user
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
                <option value="active">
                  Active
                </option>

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
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditMeter;