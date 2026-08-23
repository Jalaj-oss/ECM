import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

interface Meter {
  id: number;
  meter_number: string;
  user_id: number;
  user_name: string;
  user_email: string;
  meter_type: string;
  installation_date: string | null;
  status: "active" | "inactive";
}

const Meters = () => {
  const navigate = useNavigate();

  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeters = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(
          "/api/meters",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Failed to load meters"
          );
          return;
        }

        setMeters(data.meters);
      } catch (error) {
        console.error("Fetch meters error:", error);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchMeters();
  }, [navigate]);

  // Activate / Deactivate meter
  const handleStatusChange = async (meter: Meter) => {
    const newStatus =
      meter.status === "active"
        ? "inactive"
        : "active";

    const confirmed = window.confirm(
      `Change meter ${meter.meter_number} to ${newStatus}?`
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
        `/api/meters/${meter.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            meter_number: meter.meter_number,
            user_id: meter.user_id,
            meter_type: meter.meter_type,
            installation_date: meter.installation_date,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to update meter status"
        );
        return;
      }

      setMeters((currentMeters) =>
        currentMeters.map((currentMeter) =>
          currentMeter.id === meter.id
            ? {
                ...currentMeter,
                status: newStatus,
              }
            : currentMeter
        )
      );

      alert(`Meter changed to ${newStatus}`);
    } catch (error) {
      console.error(
        "Change meter status error:",
        error
      );

      alert("Unable to connect to server");
    }
  };

  // Delete meter
  const handleDelete = async (meter: Meter) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete meter ${meter.meter_number}?`
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
        `/api/meters/${meter.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to delete meter"
        );
        return;
      }

      setMeters((currentMeters) =>
        currentMeters.filter(
          (currentMeter) =>
            currentMeter.id !== meter.id
        )
      );

      alert("Meter deleted successfully");
    } catch (error) {
      console.error(
        "Delete meter error:",
        error
      );

      alert("Unable to connect to server");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Meters
            </h1>

            <p className="mt-2 text-gray-600">
              Manage EHMS meters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/meters/add")
              }
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Add Meter
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/dashboard")
              }
              className="rounded-lg border px-4 py-2 hover:bg-gray-100"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Meter table */}
        <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-center text-gray-500">
              Loading meters...
            </p>
          ) : error ? (
            <p className="p-6 text-center text-red-500">
              {error}
            </p>
          ) : meters.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              No meters found
            </p>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Meter Number
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Installation Date
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {meters.map((meter) => (
                  <tr
                    key={meter.id}
                    className="border-b last:border-b-0"
                  >
                    {/* Meter Number */}
                    <td className="px-6 py-4">
                      {meter.meter_number}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {meter.user_name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {meter.user_email}
                        </p>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      {meter.meter_type}
                    </td>

                    {/* Installation Date */}
                    <td className="px-6 py-4">
                      {meter.installation_date
                        ? new Date(
                            meter.installation_date
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={
                          meter.status === "active"
                            ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                            : "rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                        }
                      >
                        {meter.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/meters/${meter.id}`
                            )
                          }
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/meters/${meter.id}/edit`
                            )
                          }
                          className="text-green-600 hover:underline"
                        >
                          Edit
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(meter)
                          }
                          className={
                            meter.status === "active"
                              ? "text-orange-600 hover:underline"
                              : "text-green-600 hover:underline"
                          }
                        >
                          {meter.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(meter)
                          }
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

export default Meters;