import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id: number;
  role: "admin" | "user";
  exp: number;
  iat: number;
}
interface ProtectedRoutesProps{
    allowedRole?: "admin" |"user";
}
const ProtectedRoutes =({allowedRole}:ProtectedRoutesProps)=>{

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/" replace />;
    }
    if(allowedRole && decoded.role !==allowedRole){
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
  } catch (error) {
    console.log("Invalid token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
};
export default ProtectedRoutes;
