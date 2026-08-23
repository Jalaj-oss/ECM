import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoutes from "./components/ProtectedRoute";
import UserDashboard from "./pages/UserDashboard";
import Users from "./pages/admin/Users";
import AddUser from "./components/admin/AddUser";
import UserDetails from "./pages/admin/UserDetails";
import EditUser from "./components/admin/EditUser";
import Meters from "./pages/admin/Meters";
import AddMeter from "./pages/admin/AddMeter";
import MeterDetails from "./pages/admin/MeterDetails";
import EditMeter from "./pages/admin/EditMeter";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route element={<ProtectedRoutes allowedRole="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/users" element={<Users />} />

          <Route path="/admin/users/:id" element={<UserDetails />} />
          <Route path="/admin/meters" element={<Meters />} />
<Route path="/admin/meters/add" element={<AddMeter />} />
<Route path="/admin/meters/:id" element={<MeterDetails />} />
<Route path="/admin/meters/:id/edit" element={<EditMeter />} />
        </Route>


        <Route element={<ProtectedRoutes allowedRole="user" />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Route>
        <Route path="/admin/users/add" element={<AddUser />} />
        <Route path="/admin/users/:id/edit" element={<EditUser />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
