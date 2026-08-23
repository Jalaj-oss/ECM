import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";
import API_URL from "../../config/api";

interface Bill {
  id: number;
  meter_id: number;
  billing_month: string;
  previous_reading: number;
  current_reading: number;
  units_consumed: number;
  amount: number;
  due_date: string;
  status: string;
}

const UserBills = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadBills = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/user/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/user/bills`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load bills");
        return;
      }

      setBills(data.bills || []);
    } catch (error) {
      console.error("Load user bills error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [navigate]);

  const handlePayBill = async (bill: Bill) => {
    if (String(bill.status).toLowerCase() === "paid") {
      return;
    }

    const confirmed = window.confirm(
      `Pay bill #${bill.id} for ${bill.amount}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPayingId(bill.id);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/user/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/user/bills/${bill.id}/checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to start payment");
        return;
      }

      if (!data.checkoutUrl) {
        alert("Payment checkout URL was not returned");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Start bill payment error:", error);
      alert("Unable to connect to server");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold">My Bills</h1>
        <p className="mt-2 text-gray-600">
          View and pay your electricity bills
        </p>

        {loading ? (
          <p className="mt-8 text-gray-500">Loading bills...</p>
        ) : error ? (
          <p className="mt-8 text-red-500">{error}</p>
        ) : bills.length === 0 ? (
          <div className="mt-8 rounded-xl border bg-white p-8 text-center text-gray-500">
            No bills found.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">Billing Month</th>
                  <th className="px-6 py-4 text-left">Units</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Due Date</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {bills.map((bill) => {
                  const paid =
                    String(bill.status).toLowerCase() === "paid";

                  return (
                    <tr key={bill.id} className="border-b">
                      <td className="px-6 py-4">
                        {bill.billing_month}
                      </td>

                      <td className="px-6 py-4">
                        {bill.units_consumed}
                      </td>

                      <td className="px-6 py-4">
                        {bill.amount}
                      </td>

                      <td className="px-6 py-4">
                        {bill.due_date}
                      </td>

                      <td className="px-6 py-4">
                        {bill.status}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/user/bills/${bill.id}`)
                            }
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </button>

                          {!paid && (
                            <button
                              type="button"
                              disabled={payingId === bill.id}
                              onClick={() => handlePayBill(bill)}
                              className="text-green-600 hover:underline disabled:opacity-50"
                            >
                              {payingId === bill.id
                                ? "Starting..."
                                : "Pay Bill"}
                            </button>
                          )}

                          {paid && (
                            <span className="text-green-600">
                              Paid
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserBills;
