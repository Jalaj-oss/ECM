import { Link, useLocation, useNavigate } from "react-router-dom";

const UserSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const links = [
    ["/user/dashboard", "Dashboard"],
    ["/user/profile", "My Profile"],
    ["/user/meters", "My Meter"],
    ["/user/bills", "My Bills"],
    ["/user/payments", "My Payments"],
  ];

  return (
    <aside className="min-h-screen w-64 border-r bg-white p-6">
      <h2 className="text-2xl font-bold">EHMS</h2>
      <p className="mt-1 text-gray-500">User Panel</p>
      <nav className="mt-8 space-y-2">
        {links.map(([to, label]) => (
          <Link key={to} to={to}
            className={`block rounded-lg px-4 py-3 ${
              location.pathname === to
                ? "bg-blue-50 font-semibold text-blue-600"
                : "hover:bg-gray-100"
            }`}>
            {label}
          </Link>
        ))}
        <button type="button"
          onClick={() => { localStorage.removeItem("token"); navigate("/user/login"); }}
          className="mt-6 block w-full rounded-lg px-4 py-3 text-left text-red-600 hover:bg-red-50">
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default UserSidebar;
