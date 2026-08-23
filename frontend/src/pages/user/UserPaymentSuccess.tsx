import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";

const UserPaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-lg rounded-xl border bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">✓</div>

          <h1 className="mt-4 text-3xl font-bold">
            Payment Submitted
          </h1>

          <p className="mt-3 text-gray-600">
            Your payment was sent to the payment provider successfully.
            Your bill will be marked paid after the secure payment
            confirmation is received.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/user/bills")}
              className="rounded-lg bg-blue-500 px-5 py-3 text-white hover:bg-blue-600"
            >
              My Bills
            </button>

            <button
              type="button"
              onClick={() => navigate("/user/payments")}
              className="rounded-lg border px-5 py-3 hover:bg-gray-100"
            >
              My Payments
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserPaymentSuccess;
