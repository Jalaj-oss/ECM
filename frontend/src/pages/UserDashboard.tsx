import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar";
import API_URL from "../config/api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/user/login");
      try {
        const r = await fetch(`${API_URL}/api/user/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        if (!r.ok) return setError(d.message || "Failed to load dashboard");
        setData(d);
      } catch { setError("Unable to connect to server"); }
    };
    load();
  }, [navigate]);

  return <div className="flex min-h-screen bg-gray-50"><UserSidebar /><main className="flex-1 p-8">
    <h1 className="text-3xl font-bold">Welcome, {data?.user?.name || "User"}</h1>
    <p className="mt-2 text-gray-600">Manage your EHMS account</p>
    {error ? <p className="mt-8 text-red-500">{error}</p> : data && <>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          ["My Meters", data.meters.length, "/user/meters"],
          ["My Bills", data.bills.length, "/user/bills"],
          ["My Payments", data.payments.length, "/user/payments"]
        ].map(([label, count, path]) =>
          <button key={String(path)} onClick={() => navigate(String(path))}
            className="rounded-xl border bg-white p-6 text-left shadow-sm hover:shadow">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-bold">{String(count)}</p>
          </button>
        )}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Latest Meter</h2>
          {data.meters[0] ? <div className="mt-4 space-y-2">
            <p>Meter: {data.meters[0].meter_number}</p>
            <p>Type: {data.meters[0].meter_type}</p>
            <p>Status: {data.meters[0].status}</p>
          </div> : <p className="mt-4 text-gray-500">No meter assigned.</p>}
        </section>
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Latest Bill</h2>
          {data.bills[0] ? <div className="mt-4 space-y-2">
            <p>Amount: {data.bills[0].amount}</p>
            <p>Due: {data.bills[0].due_date}</p>
            <p>Status: {data.bills[0].status}</p>
          </div> : <p className="mt-4 text-gray-500">No bills found.</p>}
        </section>
      </div>
    </>}
  </main></div>;
};
export default UserDashboard;
