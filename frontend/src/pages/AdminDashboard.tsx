import { useNavigate } from "react-router-dom"


const AdminDashboard = () => {

  const navigate=useNavigate();

  const handleLogout=()=>{
    localStorage.removeItem("token");
    navigate("/admin/login");
  }
  return (
    <div>

    <div className="min-h-screenp-8">
      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to the EHMS  Admin Dashboard</p>
      
    </div>
    <button onClick={handleLogout} className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
      Logout
    </button>
      </div>
    </div>

  )
}

export default AdminDashboard
