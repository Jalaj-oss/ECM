import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const stats = [
    {
      title: "Total Meters",
      value: 0,
    },
    {
      title: "Total Users",
      value: 0,
    },
    {
      title: "Pending Bills",
      value: 0,
    },
    {
      title: "Payments",
      value: 0,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Welcome to the EHMS Admin Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Dashboard cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">
                {stat.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {stat.value}
              </h2>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;