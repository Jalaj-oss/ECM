import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";

const UserProfile = () => {
  const navigate = useNavigate(); const [user, setUser] = useState<any>(); const [error, setError] = useState("");
  useEffect(() => { (async () => {
    const token = localStorage.getItem("token"); if (!token) return navigate("/user/login");
    try { const r = await fetch("/api/user/profile",{headers:{Authorization:`Bearer ${token}`}});
      const d=await r.json(); if(!r.ok) setError(d.message||"Failed to load profile"); else setUser(d.user);
    } catch { setError("Unable to connect to server"); }
  })(); }, [navigate]);
  return <div className="flex min-h-screen bg-gray-50"><UserSidebar/><main className="flex-1 p-8">
    <h1 className="text-3xl font-bold">My Profile</h1>{error&&<p className="mt-6 text-red-500">{error}</p>}
    {user&&<div className="mt-8 max-w-lg rounded-xl border bg-white p-6 shadow-sm space-y-5">
      <p><span className="text-gray-500">Name:</span> {user.name}</p>
      <p><span className="text-gray-500">Email:</span> {user.email}</p>
      <p><span className="text-gray-500">Role:</span> {user.role}</p>
    </div>}
  </main></div>;
};
export default UserProfile;
