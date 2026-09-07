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
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["My Meters", data.meters.length, "/user/meters"],
          ["My Bills", data.bills.length, "/user/bills"],
          ["My Payments", data.payments.length, "/user/payments"],
          ["Complaints", data.complaints?.length || 0, "/user/complaints"],
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
          <h2 className="text-xl font-semibold">Profile Details</h2>
          <div className="mt-4 space-y-2">
            <p>Name: {data.user.name || "Not provided"}</p>
            <p>Email: {data.user.email || "Not provided"}</p>
            <p>Phone Number: {data.user.phone || "Not provided"}</p>
            <p>Address: {data.user.address || "Not provided"}</p>
          </div>
        </section>
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Complaints & Grievances</h2>
            <button
              onClick={() => navigate("/user/complaints")}
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              + Raise Complaint
            </button>
          </div>
          {data.complaints && data.complaints[0] ? (
            <div className="mt-4 space-y-2">
              <p><span className="text-gray-500">Latest:</span> {data.complaints[0].subject}</p>
              <p><span className="text-gray-500">Category:</span> {data.complaints[0].category}</p>
              <p><span className="text-gray-500">Status:</span> <span className="font-semibold capitalize text-blue-600">{data.complaints[0].status.replace('_', ' ')}</span></p>
            </div>
          ) : (
            <div className="mt-4 text-gray-500">
              <p>No active complaints.</p>
              <p className="mt-1 text-xs text-gray-400">Having billing or meter issues? Raise a complaint anytime.</p>
            </div>
          )}
        </section>
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
