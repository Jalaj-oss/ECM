import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";
import API_URL from "../../config/api";

const UserPaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<{
    billId?: number;
    amount?: number;
    transactionId?: string;
  }>({});

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/user/login");
        return;
      }

      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/user/checkout/verify?session_id=${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to verify payment");
        } else {
          setDetails({
            billId: data.billId,
            amount: data.amount,
            transactionId: data.transactionId,
          });
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError("Unable to connect to server to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />

      <main className="flex-1 p-8">
        <div className="mx-auto max-w-lg rounded-xl border bg-white p-8 text-center shadow-sm">
          {loading ? (
            <div className="py-8">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 font-medium text-gray-600">
                Verifying your payment with Stripe...
              </p>
            </div>
          ) : error ? (
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
                ✕
              </div>
              <h1 className="mt-4 text-3xl font-bold">Verification Notice</h1>
              <p className="mt-3 text-red-600">{error}</p>
              <div className="mt-8 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/user/bills")}
                  className="rounded-lg bg-blue-500 px-5 py-3 font-medium text-white hover:bg-blue-600"
                >
                  View My Bills
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                ✓
              </div>

              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                Payment Successful!
              </h1>

              <p className="mt-2 text-gray-600">
                Your electricity bill payment has been successfully processed and recorded.
              </p>

              {details.billId && (
                <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left space-y-2 text-sm border">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bill ID:</span>
                    <span className="font-semibold">#{details.billId}</span>
                  </div>
                  {details.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount Paid:</span>
                      <span className="font-semibold text-green-600">
                        ₹{Number(details.amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {details.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Transaction ID:</span>
                      <span className="font-mono text-xs text-gray-700">
                        {details.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/user/bills")}
                  className="rounded-lg bg-blue-500 px-5 py-3 font-medium text-white hover:bg-blue-600"
                >
                  My Bills
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/user/payments")}
                  className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-100"
                >
                  My Payments
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserPaymentSuccess;
