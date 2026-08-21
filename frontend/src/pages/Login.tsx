
import { Link } from "react-router-dom"
const Login = () => {
  return (
    <div>
        <nav className="flex h-16 items-center justify-between bg-blue-500 px-8 text-white"></nav>
    <div className=" flex min-h-screen flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-center text-emerald-700 ">EHMS</h1>
      <p className="mt-2 text-center text-2xl font-bold"> Select Your Account Type</p>
      <div className="mt-8 flex gap-6">
        {/* Admin */}
      <div className=" w-64 space-y-4 rounded-xl border border-black-300 p-6 shadow">
        <h2 className="text-xl font-bold">Admin</h2>
        <p>For Admin Login</p>
        <Link to="/admin/login"
        className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Admin Login</Link>
        </div>
        {/* User */}
      <div className="w-64 space-y-4 rounded-xl border border-black-300 p-6 shadow">
        <h2 className="text-xl font-bold">User</h2> 
        <p>For Customer Login</p>
        <Link to="/user/login" 
        className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">User Login</Link>
      </div>
    </div>
    </div>
    </div>
  )
}

export default Login
