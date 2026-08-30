import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

import ProtectedRoutes from "./components/ProtectedRoute";

// Admin - Users
import Users from "./pages/admin/Users";
import AddUser from "./components/admin/AddUser";
import UserDetails from "./pages/admin/UserDetails";
import EditUser from "./components/admin/EditUser";

// Admin - Meters
import Meters from "./pages/admin/Meters";
import AddMeter from "./pages/admin/AddMeter";
import MeterDetails from "./pages/admin/MeterDetails";
import EditMeter from "./pages/admin/EditMeter";

// Admin - Bills
import Bills from "./pages/admin/Bills";
import AddBill from "./components/admin/AddBill";
import BillDetails from "./pages/admin/BillDetails";
import EditBill from "./pages/admin/EditBill";

// Admin - Payments
import Payments from "./pages/admin/Payments";
import AddPayment from "./components/admin/AddPayment";
import PaymentDetails from "./pages/admin/PaymentDetails";

// Admin - Reports
import Reports from "./pages/admin/Reports";

// User
import UserProfile from "./pages/user/UserProfile";
import UserMeter from "./pages/user/UserMeter";
import UserBills from "./pages/user/UserBills";
import UserBillDetails from "./pages/user/UserBillDetails";
import UserPayments from "./pages/user/UserPayments";
import UserPaymentDetails from "./pages/user/UserPaymentDetails";
import UserRegister from "./pages/UserRegister";
import UserPaymentSuccess from "./pages/user/UserPaymentSuccess";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================== */}

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />


        {/* =========================
            ADMIN ROUTES
        ========================== */}

        <Route element={<ProtectedRoutes allowedRole="admin" />}>

          {/* Dashboard */}
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          {/* Users */}
          <Route
            path="/admin/users"
            element={<Users />}
          />

          <Route
            path="/admin/users/add"
            element={<AddUser />}
          />

          <Route
            path="/admin/users/:id"
            element={<UserDetails />}
          />

          <Route
            path="/admin/users/:id/edit"
            element={<EditUser />}
          />


          {/* Meters */}
          <Route
            path="/admin/meters"
            element={<Meters />}
          />

          <Route
            path="/admin/meters/add"
            element={<AddMeter />}
          />

          <Route
            path="/admin/meters/:id"
            element={<MeterDetails />}
          />

          <Route
            path="/admin/meters/:id/edit"
            element={<EditMeter />}
          />


          {/* Bills */}
          <Route
            path="/admin/bills"
            element={<Bills />}
          />

          <Route
            path="/admin/bills/add"
            element={<AddBill />}
          />

          <Route
            path="/admin/bills/:id"
            element={<BillDetails />}
          />

          <Route
            path="/admin/bills/:id/edit"
            element={<EditBill />}
          />


          {/* Payments */}
          <Route
            path="/admin/payments"
            element={<Payments />}
          />

          <Route
            path="/admin/payments/add"
            element={<AddPayment />}
          />

          <Route
            path="/admin/payments/:id"
            element={<PaymentDetails />}
          />


          {/* Reports */}
          <Route
            path="/admin/reports"
            element={<Reports />}
          />

        </Route>


        {/* =========================
            USER ROUTES
        ========================== */}

        <Route element={<ProtectedRoutes allowedRole="user" />}>

          {/* Dashboard */}
          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />

          {/* Profile */}
          <Route
            path="/user/profile"
            element={<UserProfile />}
          />

          {/* Meter */}
          <Route
            path="/user/meters"
            element={<UserMeter />}
          />

          {/* Bills */}
          <Route
            path="/user/bills"
            element={<UserBills />}
          />

          <Route
            path="/user/bills/:id"
            element={<UserBillDetails />}
          />

          {/* Payments */}
          <Route
            path="/user/payments"
            element={<UserPayments />}
          />

          <Route
            path="/user/payments/:id"
            element={<UserPaymentDetails />}
          />

          <Route
            path="/user/payment-success"
            element={<UserPaymentSuccess />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;