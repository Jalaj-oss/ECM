import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoutes from "./components/ProtectedRoute";
import UserDashboard from "./pages/UserDashboard";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route element={<ProtectedRoutes  allowedRole="admin"/>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} 
         />
         </Route>
         <Route element={<ProtectedRoutes allowedRole="user"/>}>
         <Route path="/user/dashboard" element={<UserDashboard />}
         />
         </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
