import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r p-6">
      <h2 className="text-2xl font-bold">
        EHMS
      </h2>

      <p className="mt-1 text-gray-500">
        Admin Panel
      </p>

      <nav className="mt-8 space-y-2">
        <Link
          to="/admin/dashboard"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Dashboard
        </Link>

        <Link
          to="/admin/users"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Users
        </Link>

        <Link
          to="/admin/meters"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Meters
        </Link>

        <Link
          to="/admin/bills"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Bills
        </Link>

        <Link
          to="/admin/payments"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Payments
        </Link>

        <Link
          to="/admin/reports"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Reports
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;