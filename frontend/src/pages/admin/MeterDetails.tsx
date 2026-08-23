import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const MeterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meter, setMeter] = useState<Meter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMeter = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(
          `/api/meters/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Failed to load meter"
          );
          return;
        }

        setMeter(data.meter);
      } catch (error) {
        console.error("Fetch meter error:", error);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchMeter();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!meter) {
      return;
    }

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
          data.message || "Failed to delete meter"
        );
        return;
      }

      alert("Meter deleted successfully");

      navigate("/admin/meters");
    } catch (error) {
      console.error("Delete meter error:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <button
          type="button"
          onClick={() => navigate("/admin/meters")}
          className="mb-6 rounded-lg border px-4 py-2 hover:bg-gray-100"
        >
          ← Back to Meters
        </button>

        <h1 className="text-3xl font-bold">
          Meter Details
        </h1>

        {loading && (
          <p className="mt-6 text-gray-500">
            Loading meter...
          </p>
        )}

        {error && (
          <p className="mt-6 text-red-500">
            {error}
          </p>
        )}

        {meter && (
          <div className="mt-6 max-w-lg rounded-xl border bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  ID
                </p>
                <p className="font-medium">
                  {meter.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Meter Number
                </p>
                <p className="font-medium">
                  {meter.meter_number}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  User
                </p>
                <p className="font-medium">
                  {meter.user_name}
                </p>
                <p className="text-sm text-gray-500">
                  {meter.user_email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Meter Type
                </p>
                <p className="font-medium">
                  {meter.meter_type}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Installation Date
                </p>
                <p className="font-medium">
                  {meter.installation_date || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>
                <p className="font-medium">
                  {meter.status}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/admin/meters/${meter.id}/edit`
                  )
                }
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Edit Meter
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Delete Meter
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MeterDetails;